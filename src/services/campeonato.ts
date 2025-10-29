import type { CampeonatoType, CreateCampeonatoData, UpdateCampeonatoData } from "../types/campeonato";
import { API_BASE_URL, getAuthHeaders, handleResponse } from './api';

// Define a URL específica para este "módulo" (campeonatos)
const CAMP_API_URL = `${API_BASE_URL}/campeonatos`;

// --- Funções CRUD ---

/**
 * C - CREATE
 * Cria um novo campeonato
 */
export const createCampeonato = async (userData: CreateCampeonatoData): Promise<CampeonatoType> => {
    const response = await fetch(CAMP_API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

/**
 * R - READ (All)
 * Busca todos os campeonatos
 */
export const getCampeonatos = async (): Promise<CampeonatoType[]> => {
    const response = await fetch(CAMP_API_URL, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * R - READ (One)
 * Busca um campeonato pelo ID
 */
export const getCampeonatosById = async (id: number): Promise<CampeonatoType> => {
    const response = await fetch(`${CAMP_API_URL}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

/**
 * U - UPDATE
 * Atualiza um campeonato existente
 */
export const updateCampeonato = async (id: number, userData: UpdateCampeonatoData): Promise<CampeonatoType> => {
    const response = await fetch(`${CAMP_API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

/**
 * D - DELETE
 * Deleta um campeonato
 */
export const deleteCampeonato = async (id: number): Promise<void> => {
    const response = await fetch(`${CAMP_API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    await handleResponse(response); // Retorna null se for sucesso (204)
};