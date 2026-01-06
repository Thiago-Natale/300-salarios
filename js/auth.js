import { _supabase } from './config.js';
import { UI } from './ui.js';
import { iniciarApp } from './app.js';

export const Auth = {
    init: () => {
        document.getElementById('btn-login').onclick = Auth.login;
        document.getElementById('btn-signup').onclick = Auth.signup;
        document.getElementById('btn-logout').onclick = Auth.logout;
        Auth.checkUser();
    },

    checkUser: async () => {
        const { data: { user } } = await _supabase.auth.getUser();
        if (user) {
            UI.authContainer.style.display = 'none';
            UI.mainContent.style.display = 'block';
            iniciarApp(user.id);
        } else {
            UI.authContainer.style.display = 'flex';
            UI.mainContent.style.display = 'none';
        }
    },

    login: async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const { error } = await _supabase.auth.signInWithPassword({ email, password });
        if (error) alert(error.message); else Auth.checkUser();
    },

    signup: async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const { error } = await _supabase.auth.signUp({ email, password });
        if (error) alert(error.message); else alert("Verifique seu e-mail!");
    },

    logout: async () => {
        await _supabase.auth.signOut();
        location.reload();
    }
};