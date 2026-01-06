export const UI = {
    // Seletores de Autenticação e Layout
    authContainer: document.getElementById('auth-container'),
    mainContent: document.getElementById('main-content'),
    
    // Seletores do Dashboard
    progressoPercentual: document.getElementById('progresso-percentual'),
    progressBarFill: document.getElementById('progress-bar-fill'),
    valorRestante: document.getElementById('valor-restante'),
    
    // Seletores do Status e Grid
    grid: document.getElementById('grid-bolinhas'),
    statusDot: document.getElementById("status-dot"),
    statusText: document.getElementById("status-text"),

    /**
     * Gera as 300 bolinhas no grid inicial
     */
    renderGrid: () => {
        if (!UI.grid) return;
        UI.grid.innerHTML = "";
        for (let i = 0; i < 300; i++) {
            const div = document.createElement('div');
            div.classList.add('bolinha');
            UI.grid.appendChild(div);
        }
    },

    /**
     * Atualiza o estado visual das bolinhas e os dados do Dashboard
     * @param {number} valorGuardado - Total já poupado
     * @param {number} salario - Salário alvo
     */
    updateInterface: (valorGuardado, salario) => {
        const bolinhas = document.querySelectorAll('.bolinha');
        const totalBolinhas = 300;
        
        // 1. Cálculo de preenchimento (quantos salários inteiros foram guardados)
        const preencher = salario > 0 ? Math.floor(valorGuardado / salario) : 0;
        
        // 2. Atualizar Bolinhas
        bolinhas.forEach((b, i) => {
            if (i < preencher) {
                b.classList.add('filled');
            } else {
                b.classList.remove('filled');
            }
        });

        // 3. Atualizar Dashboard (Percentagem e Barra)
        const percentual = Math.min(((preencher / totalBolinhas) * 100), 100).toFixed(1);
        
        if (UI.progressoPercentual) UI.progressoPercentual.innerText = `${percentual}%`;
        if (UI.progressBarFill) UI.progressBarFill.style.width = `${percentual}%`;

        // 4. Calcular e mostrar o valor que falta para a meta
        const metaTotal = salario * totalBolinhas;
        const restante = Math.max(metaTotal - valorGuardado, 0);
        
        if (UI.valorRestante) {
            UI.valorRestante.innerText = restante.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
            });
        }
    },

    /**
     * Atualiza o indicador visual de sincronização com o Supabase
     * @param {string} state - 'saving', 'synced' ou 'error'
     */
    setStatus: (state) => {
        if (!UI.statusDot || !UI.statusText) return;

        // Resetar classes
        UI.statusDot.classList.remove('saving', 'error');
        
        if (state === 'saving') {
            UI.statusDot.classList.add('saving');
            UI.statusText.innerText = 'A guardar...';
        } else if (state === 'error') {
            UI.statusDot.classList.add('error');
            UI.statusText.innerText = 'Erro ao guardar';
        } else {
            // Estado Sincronizado (Verde)
            UI.statusText.innerText = 'Sincronizado';
        }
    }
};