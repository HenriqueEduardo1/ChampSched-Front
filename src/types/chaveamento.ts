import type { PartidaType } from "./partida";

export interface ChaveamentoType {
    message: string;
    totalPartidas: number;
    partidas: PartidaType[];
}

export interface CreateChaveamento {
    campeonatoId: number;
}