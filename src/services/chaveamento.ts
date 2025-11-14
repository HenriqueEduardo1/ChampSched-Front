
import type { ChaveamentoType } from "../types/chaveamento";
import { API_BASE_URL, getAuthHeaders, handleResponse } from "./api";

const PARTIDAS_URL = `${API_BASE_URL}/partidas/campeonato`;

export async function createChaveamentoInCampeonato(campeonatoId: number): Promise<ChaveamentoType> {
    const response = await fetch(`${PARTIDAS_URL}/${campeonatoId}/gerar-chaveamento`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
}