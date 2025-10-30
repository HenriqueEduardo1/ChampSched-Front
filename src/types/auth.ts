import type { UserType } from "../types/user";

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: UserType;
}