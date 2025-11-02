export interface OrganizadorType {
    id: number;
    nome: string;
    contato: string;
}

export interface TimeResumidoType {
    id: number;
    nome: string;
    contato: string | null;
    integrantesIds: number[];
}

export interface CampeonatoType {
    id: number;
    nome: string;
    esporte: string;
    data: string; // ISO date string
    organizador: OrganizadorType;
    times: TimeResumidoType[];
}

export interface CreateCampeonatoData {
    nome: string;
    esporte: string;
    data: string;
    organizadorId: number;
    timesIds: number[];
}

export type UpdateCampeonatoData = Partial<CreateCampeonatoData>;
