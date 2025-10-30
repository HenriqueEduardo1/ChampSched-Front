import type { UserType, CreateUserData, UpdateUserData } from '../types/user';
import { API_BASE_URL, getAuthHeaders, handleResponse } from './api';

// Define a URL específica para este "módulo" (usuários)
const USER_API_URL = `${API_BASE_URL}/users`;

// --- Funções CRUD ---

/**
 * C - CREATE
 * Cria um novo usuário
 * (No Spring Boot: @PostMapping)
 */
export async function createUser(userData: CreateUserData): Promise<UserType> {
    const response = await fetch(USER_API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

/**
 * R - READ (All)
 * Busca todos os usuários
 */
export async function getUsers(): Promise<UserType[]> {
    const response = await fetch(USER_API_URL, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * R - READ (One)
 * Busca um usuário pelo ID
 */
export async function getUserById(id: number): Promise<UserType> {
    const response = await fetch(`${USER_API_URL}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * U - UPDATE
 * Atualiza um usuário existente
 */
export async function updateUser(id: number, userData: UpdateUserData): Promise<UserType> {
    const response = await fetch(`${USER_API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

/**
 * D - DELETE
 * Deleta um usuário
 */
export async function deleteUser(id: number): Promise<void> {
    const response = await fetch(`${USER_API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    await handleResponse(response); // Retorna null se for sucesso (204)
};