import type { TimeType, CreateTimeData, UpdateTimeData } from '../types/time';
import { API_BASE_URL, getAuthHeaders, handleResponse } from './api';

// Define a URL específica para este "módulo" (times)
const TIME_API_URL = `${API_BASE_URL}/times`;

// --- Funções CRUD ---

/**
 * C - CREATE
 * Cria um novo time
 */
export async function createTime(userData: CreateTimeData): Promise<TimeType> {
    const response = await fetch(TIME_API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

/**
 * R - READ (All)
 * Busca todos os times
 */
export async function getTimes(): Promise<TimeType[]> {
    const response = await fetch(TIME_API_URL, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * R - READ (One)
 * Busca um time pelo ID
 */
export async function getTimeById(id: number): Promise<TimeType> {
    const response = await fetch(`${TIME_API_URL}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * U - UPDATE
 * Atualiza um time existente
 */
export async function updateTime(id: number, userData: UpdateTimeData): Promise<TimeType> {
    const response = await fetch(`${TIME_API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

/**
 * D - DELETE
 * Deleta um time
 */
export async function deleteTime(id: number): Promise<void> {
    const response = await fetch(`${TIME_API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    await handleResponse(response); // Retorna null se for sucesso (204)
};