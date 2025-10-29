export interface TimeType {
    id: number;
    nome: string;
    contato: string;
    integrantesId: number[];
}

export type CreateTimeData = Omit<TimeType, 'id'>;

export type UpdateTimeData = Partial<CreateTimeData>;