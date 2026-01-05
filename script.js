// CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = 'https://ddwlsisctmjqmhbajzmj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_X95ZSTtfoLiKm1oUPhXIUw_eSO4Kf6P';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('grid-bolinhas');
    const inputs = {
        nome: document.getElementById('nome'),
        data_inicio: document.getElementById('dataInicio'),
        salario: document.getElementById('salario'),
        valor_guardado: document.getElementById('valorGuardado')
    };
    const metaInput = document.getElementById('metaPatrimonio');

    // Cria as 300 bolinhas
    for (let i = 0; i < 300; i++) {
        const div = document.createElement('div');
        div.classList.add('bolinha');
        grid.appendChild(div);
    }
    const bolinhas = document.querySelectorAll('.bolinha');

    // FUNÇÃO: Buscar dados do Banco
    async function carregarDadosDoBanco() {
        const { data, error } = await _supabase
            .from('progresso_salarios')
            .select('*')
            .eq('id', 1) // Usamos ID 1 fixo para seu controle único
            .single();

        if (data) {
            inputs.nome.value = data.nome || '';
            inputs.data_inicio.value = data.data_inicio || '';
            inputs.salario.value = data.salario || 0;
            inputs.valor_guardado.value = data.valor_guardado || 0;
            atualizarInterface();
            console.log("Carregou dados do banco")
        }
    }

    // FUNÇÃO: Salvar dados no Banco (com Debounce para não sobrecarregar)
    let timeoutSalvar;
    function salvarComAtraso() {
        clearTimeout(timeoutSalvar);
        timeoutSalvar = setTimeout(async () => {
            await _supabase.from('progresso_salarios').upsert({
                id: 1,
                nome: inputs.nome.value,
                data_inicio: inputs.data_inicio.value,
                salario: parseFloat(inputs.salario.value) || 0,
                valor_guardado: parseFloat(inputs.valor_guardado.value) || 0
            });
            console.log("Sincronizado com o banco!");
        }, 1000); // Salva 1 segundo após você parar de digitar
    }

    function atualizarInterface() {
        const salario = parseFloat(inputs.salario.value) || 0;
        const guardado = parseFloat(inputs.valor_guardado.value) || 0;
        const meta = salario * 300;

        metaInput.value = meta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        if (salario > 0) {
            const preencher = Math.floor(guardado / salario);
            bolinhas.forEach((b, i) => {
                i < preencher ? b.classList.add('filled') : b.classList.remove('filled');
            });
        }
    }

    // Eventos
    Object.values(inputs).forEach(input => {
        input.addEventListener('input', () => {
            atualizarInterface();
            salvarComAtraso();
        });
    });

    // Início
    carregarDadosDoBanco();
});