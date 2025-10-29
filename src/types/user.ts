// Interface principal do Usuário
export interface UserType {
    id: number;
    username: string;
    email: string;
    contato: string;
    organizador: boolean;
}

export type CreateUserData = Omit<UserType, 'id'>;

export type UpdateUserData = Partial<CreateUserData>;