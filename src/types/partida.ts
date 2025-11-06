export interface PartidaType {
    id: number;
    campeonatoId: number;
    timeAId: number;
    timeBId: number;
    data: string; // ISO date string
    local: string;
    placarTimeA: number | null;
    placarTimeB: number | null;
}

export interface CreatePartidaData {
    campeonatoId: number;
    timeAId: number;
    timeBId: number;
    data: string;
    local: string;
}

export type UpdatePartidaData = Partial<CreatePartidaData & {
    placarTimeA: number | null;
    placarTimeB: number | null;
}>;