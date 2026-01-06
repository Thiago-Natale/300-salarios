import { _supabase } from './config.js';
import { UI } from './ui.js';

let timeoutSalvar;

export async function iniciarApp(userId) {
    const inputs = {
        nome: document.getElementById("nome"),
        data_inicio: document.getElementById("dataInicio"),
        salario: document.getElementById("salario"),
        valor_guardado: document.getElementById("valorGuardado"),
    };
    const metaDisplay = document.getElementById("metaPatrimonio");

    UI.renderGrid();

    // Carregar dados
    const { data } = await _supabase.from('progresso_salarios').select('*').eq('user_id', userId).maybeSingle();
    if (data) {
        Object.keys(inputs).forEach(key => inputs[key].value = data[key] || '');
        if (data.data_inicio) inputs.data_inicio.value = data.data_inicio.split('T')[0];
        atualizarCalculos();
    }

    function atualizarCalculos() {
        const sal = parseFloat(inputs.salario.value) || 0;
        const guard = parseFloat(inputs.valor_guardado.value) || 0;
        metaDisplay.value = (sal * 300).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        UI.updateBolinhas(guard, sal);
    }

    function salvar() {
        UI.setStatus('saving');
        clearTimeout(timeoutSalvar);
        timeoutSalvar = setTimeout(async () => {
            const { error } = await _supabase.from('progresso_salarios').upsert({
                user_id: userId,
                ...Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, v.value]))
            }, { onConflict: 'user_id' });
            UI.setStatus(error ? 'error' : 'synced');
        }, 1000);
    }

    // Listeners
    Object.values(inputs).forEach(input => {
        input.oninput = () => { atualizarCalculos(); salvar(); };
    });
}