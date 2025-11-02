import type { UserType } from "./user";

export interface TimeType {
    id: number;
    nome: string;
    contato: string;
    integrantes: UserType[];
}

export interface CreateTimeData {
    nome: string;
    contato?: string;
    integrantesIds: number[];
}

export type UpdateTimeData = Partial<CreateTimeData>;