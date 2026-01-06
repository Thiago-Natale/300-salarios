import { _supabase } from './config.js';
import { UI } from './ui.js';
import { iniciarApp } from './app.js';

export const Auth = {
    init: () => {
        // Eventos de Autenticação (Login e Cadastro)
        const btnLogin = document.getElementById('btn-login');
        const btnSignup = document.getElementById('btn-signup');

        if (btnLogin) btnLogin.onclick = Auth.login;
        if (btnSignup) btnSignup.onclick = Auth.signup;

        // Verifica se já existe uma sessão ativa
        Auth.checkUser();
    },

    checkUser: async () => {
        const { data: { user } } = await _supabase.auth.getUser();
        
        if (user) {
            UI.authContainer.style.display = 'none';
            UI.mainContent.style.display = 'block';
            
            // Configura o botão de logout somente após mostrar o mainContent
            const btnLogout = document.getElementById('btn-logout');
            if (btnLogout) {
                btnLogout.onclick = Auth.logout;
            }

            iniciarApp(user.id);
        } else {
            UI.authContainer.style.display = 'flex';
            UI.mainContent.style.display = 'none';
        }
    },

    login: async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            alert("Por favor, preencha e-mail e senha.");
            return;
        }

        const { error } = await _supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            alert("Erro no login: " + error.message);
        } else {
            Auth.checkUser();
        }
    },

    signup: async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const { error } = await _supabase.auth.signUp({ email, password });
        
        if (error) {
            alert("Erro no cadastro: " + error.message);
        } else {
            alert("Cadastro realizado! Verifique seu e-mail (se a confirmação estiver ativa).");
        }
    },

    logout: async () => {
        const { error } = await _supabase.auth.signOut();
        if (error) {
            console.error("Erro ao sair:", error);
        } else {
            // Limpa o estado e recarrega a página para voltar à tela de login
            window.location.reload();
        }
    }
};