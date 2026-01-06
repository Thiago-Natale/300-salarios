import { _supabase } from './config.js';
import { UI } from './ui.js';

let timeoutSalvar;

export async function iniciarApp(userId) {
    // Seletores dos inputs
    const inputs = {
        nome: document.getElementById("nome"),
        data_inicio: document.getElementById("dataInicio"),
        salario: document.getElementById("salario"),
        valor_guardado: document.getElementById("valorGuardado"),
    };
    const metaDisplay = document.getElementById("metaPatrimonio");

    // Inicializa o grid de 300 bolinhas
    UI.renderGrid();

    // 1. BUSCAR DADOS DO BANCO
    const { data, error } = await _supabase
        .from('progresso_salarios')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error("Erro ao carregar dados:", error);
    }

    // 2. PREENCHER CAMPOS SE EXISTIREM DADOS
    if (data) {
        if (inputs.nome) inputs.nome.value = data.nome || '';
        if (inputs.salario) inputs.salario.value = data.salario || 0;
        if (inputs.valor_guardado) inputs.valor_guardado.value = data.valor_guardado || 0;
        
        if (data.data_inicio && inputs.data_inicio) {
            inputs.data_inicio.value = data.data_inicio.split('T')[0];
        }
        
        // Atualiza a interface logo após carregar
        atualizarCalculos();
    }

    // 3. FUNÇÃO DE CÁLCULO (AQUI FOI CORRIGIDO O ERRO)
    function atualizarCalculos() {
        const sal = parseFloat(inputs.salario.value) || 0;
        const guard = parseFloat(inputs.valor_guardado.value) || 0;
        
        // Calcula a Meta (Salário * 300)
        const metaCalculada = sal * 300;
        if (metaDisplay) {
            metaDisplay.value = metaCalculada.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
            });
        }

        // CHAMA A FUNÇÃO CORRETA NO UI.JS
        UI.updateInterface(guard, sal);
    }

    // 4. FUNÇÃO DE SALVAMENTO AUTOMÁTICO (DEBOUNCE)
    function salvar() {
        UI.setStatus('saving');
        clearTimeout(timeoutSalvar);
        
        timeoutSalvar = setTimeout(async () => {
            const payload = {
                user_id: userId,
                nome: inputs.nome.value,
                data_inicio: inputs.data_inicio.value,
                salario: parseFloat(inputs.salario.value) || 0,
                valor_guardado: parseFloat(inputs.valor_guardado.value) || 0
            };

            const { error } = await _supabase
                .from('progresso_salarios')
                .upsert(payload, { onConflict: 'user_id' });

            if (error) {
                console.error("Erro ao salvar:", error);
                UI.setStatus('error');
            } else {
                UI.setStatus('synced');
            }
        }, 1000); // Aguarda 1 segundo após parar de digitar
    }

    // 5. EVENT LISTENERS
    Object.values(inputs).forEach(input => {
        if (input) {
            input.oninput = () => { 
                atualizarCalculos(); 
                salvar(); 
            };
        }
    });
}