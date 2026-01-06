export const UI = {
    authContainer: document.getElementById('auth-container'),
    mainContent: document.getElementById('main-content'),
    grid: document.getElementById('grid-bolinhas'),
    statusDot: document.getElementById("status-dot"),
    statusText: document.getElementById("status-text"),
    
    // Cria as bolinhas uma única vez
    renderGrid: () => {
        UI.grid.innerHTML = "";
        for (let i = 0; i < 300; i++) {
            const div = document.createElement('div');
            div.classList.add('bolinha');
            UI.grid.appendChild(div);
        }
    },

    updateBolinhas: (valorGuardado, salario) => {
        const bolinhas = document.querySelectorAll('.bolinha');
        const preencher = Math.floor(valorGuardado / salario) || 0;
        bolinhas.forEach((b, i) => {
            i < preencher ? b.classList.add('filled') : b.classList.remove('filled');
        });
    },

    setStatus: (state) => {
        UI.statusDot.className = 'dot ' + (state === 'synced' ? '' : state);
        UI.statusText.innerText = state === 'saving' ? 'Salvando...' : 
                                 state === 'error' ? 'Erro ao salvar' : 'Sincronizado';
    }
};