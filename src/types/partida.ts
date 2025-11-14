export interface PartidaType {
    id: number;
    fase: number;
    timeA: string | null;
    timeB: string | null;
    proximaPartidaId: number | null;
    posicaoNaProximaPartida: number | null;
}