// 1. CONFIGURAÇÃO INICIAL
const SUPABASE_URL = "https://ddwlsisctmjqmhbajzmj.supabase.co";
const SUPABASE_KEY = "sb_publishable_X95ZSTtfoLiKm1oUPhXIUw_eSO4Kf6P"; // Certifique-se de usar a anon key correta
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const authContainer = document.getElementById('auth-container');
const mainContent = document.getElementById('main-content');
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");

// 2. LÓGICA DE AUTENTICAÇÃO (LOGIN/LOGOUT)
document.getElementById('btn-signup').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await _supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Verifique seu e-mail para confirmar!');
});

document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else checkUser(); // Se logar, atualiza a tela
});

document.getElementById('btn-logout').addEventListener('click', async () => {
    await _supabase.auth.signOut();
    location.reload();
});

// 3. VERIFICAÇÃO DE SESSÃO
async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();
    
    if (user) {
        // Se estiver logado: Esconde login e mostra o app
        authContainer.style.display = 'none';
        mainContent.style.display = 'block';
        
        // Remove a classe do body que centraliza (se houver) para o app rolar normalmente
        document.body.style.display = 'block'; 
        
        iniciarApp(user.id);
    } else {
        // Se não estiver logado: Mostra apenas o login centralizado
        authContainer.style.display = 'flex';
        mainContent.style.display = 'none';
        document.body.style.display = 'flex';
        document.body.style.alignItems = 'center';
        document.body.style.justifyContent = 'center';
        document.body.style.minHeight = '100vh';
    }
}

// 4. LÓGICA PRINCIPAL DA APLICAÇÃO (Encapsulada para rodar após o login)
function iniciarApp(userId) {
    const grid = document.getElementById("grid-bolinhas");
    const inputs = {
        nome: document.getElementById("nome"),
        data_inicio: document.getElementById("dataInicio"),
        salario: document.getElementById("salario"),
        valor_guardado: document.getElementById("valorGuardado"),
    };
    const metaInput = document.getElementById("metaPatrimonio");

    // Limpa e cria as 300 bolinhas
    grid.innerHTML = "";
    for (let i = 0; i < 300; i++) {
        const div = document.createElement("div");
        div.classList.add("bolinha");
        grid.appendChild(div);
    }
    const bolinhas = document.querySelectorAll(".bolinha");

    // FUNÇÃO: Buscar dados do Banco (Filtrado por UserID)
    async function carregarDadosDoBanco() {
        const { data, error } = await _supabase
            .from('progresso_salarios')
            .select('*')
            .eq('user_id', userId) // <-- FILTRO POR USUÁRIO
            .maybeSingle(); // Retorna um objeto ou nulo, sem dar erro 406

        if (data) {
            inputs.nome.value = data.nome || '';
            inputs.salario.value = data.salario || 0;
            inputs.valor_guardado.value = data.valor_guardado || 0;
            if (data.data_inicio) {
                inputs.data_inicio.value = data.data_inicio.split("T")[0];
            }
            atualizarInterface();
        }
    }

    // FUNÇÃO: Salvar (Com Debounce)
    let timeoutSalvar;
    function setStatus(state) {
        statusDot.classList.remove("saving", "error");
        if (state === "saving") {
            statusDot.classList.add("saving");
            statusText.innerText = "Salvando...";
        } else if (state === "synced") {
            statusText.innerText = "Sincronizado";
        } else if (state === "error") {
            statusDot.classList.add("error");
            statusText.innerText = "Erro ao salvar";
        }
    }

    function salvarComAtraso() {
    setStatus("saving");
    clearTimeout(timeoutSalvar);
    timeoutSalvar = setTimeout(async () => {
        const { error } = await _supabase.from("progresso_salarios").upsert({
            user_id: userId, // O id que veio da função iniciarApp
            nome: inputs.nome.value,
            data_inicio: inputs.data_inicio.value,
            salario: parseFloat(inputs.salario.value) || 0,
            valor_guardado: parseFloat(inputs.valor_guardado.value) || 0,
        }, { onConflict: 'user_id' }); // IMPORTANTE: diz ao banco para usar o user_id como referência

        if (error) {
            console.error("Erro Supabase:", error);
            setStatus("error");
        } else {
            setStatus("synced");
        }
    }, 1000);
}

    function atualizarInterface() {
        const salario = parseFloat(inputs.salario.value) || 0;
        const guardado = parseFloat(inputs.valor_guardado.value) || 0;
        const meta = salario * 300;
        metaInput.value = meta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        if (salario > 0) {
            const preencher = Math.floor(guardado / salario);
            bolinhas.forEach((b, i) => {
                i < preencher ? b.classList.add("filled") : b.classList.remove("filled");
            });
        }
    }

    // Eventos de Input
    Object.values(inputs).forEach((input) => {
        input.addEventListener("input", () => {
            atualizarInterface();
            salvarComAtraso();
        });
    });

    // Carga Inicial
    carregarDadosDoBanco();
}

// Função para mostrar mensagens na tela de login
function mostrarMensagemAuth(texto) {
    const msgElement = document.getElementById('auth-msg');
    msgElement.innerText = texto;
    setTimeout(() => msgElement.innerText = '', 5000);
}

// Atualize seus botões de cadastro e login para usar essa função
document.getElementById('btn-signup').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) return mostrarMensagemAuth('Preencha todos os campos.');
    
    const { error } = await _supabase.auth.signUp({ email, password });
    if (error) mostrarMensagemAuth(error.message);
    else mostrarMensagemAuth('Sucesso! Verifique seu e-mail.');
});

document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) mostrarMensagemAuth('Dados inválidos ou erro de conexão.');
    else checkUser();
});

// 5. INICIALIZAÇÃO AO CARREGAR PÁGINA
document.addEventListener("DOMContentLoaded", checkUser);