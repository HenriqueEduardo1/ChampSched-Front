import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getMe, login as loginService, register as registerService } from '../services/auth';
import type { UserType, CreateUserData } from '../types/user';
import type { LoginCredentials } from '../types/auth';

interface AuthContextState {
    isAuthenticated: boolean;
    user: UserType | null;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (userData: CreateUserData) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserType | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Começa true para verificação inicial

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setIsLoading(false); // Não há token, não está logado
                return;
            }

            try {
                // Tenta buscar o usuário com o token salvo
                const userData = await getMe();
                setUser(userData); // Sucesso! Salva o usuário no estado
            } catch (error) {
                // Token inválido ou expirado
                localStorage.removeItem('authToken');
                setUser(null);
            } finally {
                setIsLoading(false); // Terminou a verificação
            }
        };

        checkToken();
    }, []); // O array vazio [] garante que isso rode só no início

    const login = async (credentials: LoginCredentials) => {
        // Chama o serviço de API
        const { user } = await loginService(credentials);
        // Atualiza o estado
        setUser(user);
    };

    const register = async (userData: CreateUserData) => {
        // Chama o serviço de API
        const { user } = await registerService(userData);
        // Atualiza o estado
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
        // Opcional: redirecionar via window.location.href = '/login'
    };

    const value: AuthContextState = {
        isAuthenticated: !!user, // Verdadeiro se 'user' não for nulo
        user,
        isLoading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};