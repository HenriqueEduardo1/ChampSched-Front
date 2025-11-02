import type { CampeonatoType, CreateCampeonatoData, UpdateCampeonatoData } from "../types/campeonato";
import { API_BASE_URL, getAuthHeaders, handleResponse } from './api';

// Define a URL específica para este "módulo" (campeonatos)
const CAMP_API_URL = `${API_BASE_URL}/campeonatos`;

export async function createCampeonato(userData: CreateCampeonatoData): Promise<CampeonatoType> {
    const response = await fetch(CAMP_API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

export async function getCampeonatos(): Promise<CampeonatoType[]> {
    const response = await fetch(CAMP_API_URL, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

export async function getCampeonatosById(id: number): Promise<CampeonatoType> {
    const response = await fetch(`${CAMP_API_URL}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

export async function updateCampeonato(id: number, userData: UpdateCampeonatoData): Promise<CampeonatoType> {
    const response = await fetch(`${CAMP_API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};


export async function deleteCampeonato(id: number): Promise<void> {
    const response = await fetch(`${CAMP_API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    await handleResponse(response); 
};