import type { PartidaType } from "./partida";

export interface ChaveamentoType {
    message: string;
    totalPartidas: number;
    partidas: PartidaType[];
}