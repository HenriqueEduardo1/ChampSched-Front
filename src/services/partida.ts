import type { CreatePartidaData, PartidaType } from "../types/partida";
import { API_BASE_URL, getAuthHeaders, handleResponse } from "./api";


const CAMP_PARTIDAS_URL = `${API_BASE_URL}/campeonatos/{campeonatoId}/partidas`;
const PARTIDAS_URL = `${API_BASE_URL}/partidas`;

export async function createPartida(partidaData: CreatePartidaData): Promise<PartidaType> {
    const response = await fetch(CAMP_PARTIDAS_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(partidaData),
    });
    return handleResponse(response);
};

export async function getPartidasByCampeonato(campeonatoId: number): Promise<PartidaType[]> {
    const response = await fetch(CAMP_PARTIDAS_URL.replace("{campeonatoId}", String(campeonatoId)), {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

export async function getPartidaById(id: number): Promise<PartidaType> {
    const response = await fetch(`${PARTIDAS_URL}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

export async function updatePartida(id: number, partidaData: CreatePartidaData): Promise<PartidaType> {
    const response = await fetch(`${PARTIDAS_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(partidaData),
    });
    return handleResponse(response);
};

export async function deletePartida(id: number): Promise<void> {
    const response = await fetch(`${PARTIDAS_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};