import type { LoginCredentials, AuthResponse } from '../types/auth';
import type { CreateUserData, UserType } from '../types/user';

import {
    API_BASE_URL,
    getAuthHeaders,
    getPublicHeaders,
    handleResponse
} from './api';

/**
 * Protótipo da Função de Login
 * Envia credenciais, recebe um token e dados do usuário.
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (credentials.username === 'admin' && credentials.password === '123') {
        const data: AuthResponse = {
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
        localStorage.setItem('authToken', data.token);
        return data;
    }
    // Chamada real à API
    const response = await fetch(`${API_BASE_URL}/login`, {
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
};

/**
 * Protótipo da Função de Registro
 * (A ser usada pela sua AddUserPage)
 *
 * Envia dados do novo usuário, recebe o usuário criado e um token.
 */
export const register = async (userData: CreateUserData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getPublicHeaders(),
        body: JSON.stringify(userData),
    });
    
    const data: AuthResponse = await handleResponse(response);

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
};

/**
 * Protótipo da Função "Get Me"
 * Usa o token salvo para buscar os dados do usuário logado.
 */
export const getMe = async (): Promise<UserType> => {

    const token = localStorage.getItem('authToken');
    if (token === 'fake-jwt-token-from-login-123') {
        const fakeUser: UserType = {
            id: 2,
            nome: 'Admin (Simulado)',
            username: 'admin',
            email: 'admin@chamsched.com',
            contato: '999999999',
            organizador: true
        };
        return new Promise(resolve => setTimeout(() => resolve(fakeUser), 300));
    }

    // Chamada real à API
    const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
};