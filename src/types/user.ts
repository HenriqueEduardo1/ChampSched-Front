// Interface principal do Usuário
export interface UserType {
    id: number;
    nome: string;
    username: string;
    email: string;
    contato: string;
    organizador: boolean;
}

export type CreateUserData = Omit<UserType, 'id'> & { senha: string };

export type UpdateUserData = Partial<CreateUserData>;