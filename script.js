// 1. CONFIGURAÇÃO INICIAL
const SUPABASE_URL = "https://ddwlsisctmjqmhbajzmj.supabase.co";
const SUPABASE_KEY = "SUA_CHAVE_AQUI"; // Certifique-se de usar a anon key correta
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
        authContainer.style.display = 'none';
        mainContent.style.display = 'block';
        // Inicia a aplicação passando o ID do usuário logado
        iniciarApp(user.id);
    } else {
        authContainer.style.display = 'block';
        mainContent.style.display = 'none';
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
                user_id: userId, // <-- GARANTE QUE O DADO É DESTE USUÁRIO
                nome: inputs.nome.value,
                data_inicio: inputs.data_inicio.value,
                salario: parseFloat(inputs.salario.value) || 0,
                valor_guardado: parseFloat(inputs.valor_guardado.value) || 0,
            }, { onConflict: 'user_id' }); // Atualiza se o user_id já existir

            if (error) {
                console.error(error);
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

// 5. INICIALIZAÇÃO AO CARREGAR PÁGINA
document.addEventListener("DOMContentLoaded", checkUser);