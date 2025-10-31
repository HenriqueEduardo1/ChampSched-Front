import type { UserType } from "./user";

export interface TimeType {
    id: number;
    nome: string;
    contato: string;
    integrantes: UserType[];
}

export type CreateTimeData = Omit<TimeType, 'id'>;

export type UpdateTimeData = Partial<CreateTimeData>;