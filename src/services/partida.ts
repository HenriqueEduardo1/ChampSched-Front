import type { ApiResponse } from "../types/api";
import type { PartidaType } from "../types/partida";
import { API_BASE_URL, getAuthHeaders, handleResponse } from "./api";

const PARTIDAS_URL = `${API_BASE_URL}/partidas/campeonato`;

export async function getPartidasByCampeonato(campeonatoId: number): Promise<PartidaType[]> {
    const response = await fetch(PARTIDAS_URL + `/${campeonatoId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

export async function deletePartidas(campeonatoId: number): Promise<ApiResponse> {
    const response = await fetch(`${PARTIDAS_URL}/${campeonatoId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};