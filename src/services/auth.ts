import type { LoginCredentials, AuthResponse } from '../types/auth';
import type { CreateUserData, UserType } from '../types/user';

import {
    API_BASE_URL,
    getAuthHeaders,
    getPublicHeaders,
    handleResponse
} from './api';

// URL base para os endpoints de autenticação
const AUTH_API_URL = `${API_BASE_URL}/auth`;

/**
 * Protótipo da Função de Login
 * Envia credenciais, recebe um token e dados do usuário.
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulação (remover isso quando o backend estiver pronto)
    if (credentials.username === 'admin' && credentials.password === '123') {
        const fakeResponse: AuthResponse = {
            token: 'fake-jwt-token-from-login-123',
            user: {
                id: 1,
                nome: 'Admin',
                username: 'admin',
                email: 'admin@chamsched.com',
                contato: '999999999',
                organizador: true
            }
        };
        // Salva o token simulado
        localStorage.setItem('authToken', fakeResponse.token);
        return fakeResponse;
    } else {
        throw new Error('Usuário ou senha inválidos (simulação)');
    }

    /* // ---- CÓDIGO REAL (quando o backend estiver pronto) ----
    const response = await fetch(`${AUTH_API_URL}/login`, {
        method: 'POST',
        headers: getPublicHeaders(), // Login é uma chamada pública
        body: JSON.stringify(credentials),
    });
    
    const data: AuthResponse = await handleResponse(response);

    // Se o login for bem-sucedido, salve o token
    if (data.token) {
        localStorage.setItem('authToken', data.token);
    }
    
    return data;
    */
};

/**
 * Protótipo da Função de Registro
 * (A ser usada pela sua AddUserPage)
 *
 * Envia dados do novo usuário, recebe o usuário criado e um token.
 */
export const register = async (userData: CreateUserData): Promise<AuthResponse> => {
    const response = await fetch(`${AUTH_API_URL}/register`, {
        method: 'POST',
        headers: getPublicHeaders(), // Registro é uma chamada pública
        body: JSON.stringify(userData),
    });
    
    const data: AuthResponse = await handleResponse(response);

    // Se o registro for bem-sucedido, já faz o login
    if (data.token) {
        localStorage.setItem('authToken', data.token);
    }

    return data;
};

/**
 * Protótipo da Função de Logout
 * (A ser usada pelo seu MainToolbar)
 *
 * Limpa o token do localStorage.
 */
export const logout = (): void => {
    localStorage.removeItem('authToken');
    // Forçar um recarregamento da página para ir ao /login
    // window.location.href = '/login';
};

/**
 * Protótipo da Função "Get Me"
 * Usa o token salvo para buscar os dados do usuário logado.
 */
export const getMe = async (): Promise<UserType> => {
    const token = localStorage.getItem('authToken'); // Simulação (remover depois)
    if (token === 'fake-jwt-token-from-login-123') {
        console.warn("SIMULAÇÃO: Retornando usuário 'admin' para getMe()");
        const fakeUser: UserType = {
            id: 1,
            nome: 'Admin (Simulado)',
            username: 'admin',
            email: 'admin@chamsched.com',
            contato: '999999999',
            organizador: true
        };
        // Retorna o usuário falso após um pequeno atraso
        return new Promise(resolve => setTimeout(() => resolve(fakeUser), 500));
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, { // Endpoint comum para "quem sou eu"
        method: 'GET',
        headers: getAuthHeaders(), // Esta chamada é AUTENTICADA
    });
    
    return handleResponse(response);
};