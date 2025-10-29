export interface CampeonatoType {
    id: number;
    nome: string;
    esporte: string;
    timesId: number[];
    descricao?: string;
    dataInicio: string; // ISO date string
    dataFim?: string;  // ISO date string
    modalidade: string;
    organizadorId: number;
}

export type CreateCampeonatoData = Omit<CampeonatoType, 'id'>;

export type UpdateCampeonatoData = Partial<CreateCampeonatoData>;
