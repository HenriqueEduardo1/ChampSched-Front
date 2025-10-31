/**
 * URL base da sua API Spring Boot.
 * (Pode ser movido para um arquivo .env no futuro)
 */
export const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Retorna os headers de autenticação (Bearer Token)
 */
export const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Trata respostas de erro da API (qualquer status que não seja 2xx)
 */
export const handleResponse = async (response: Response) => {
    if (!response.ok) {
        // Tenta extrair a mensagem de erro do backend Spring Boot
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Erro ${response.status}`;
        throw new Error(errorMessage);
    }
    
    // Retorna null para respostas 204 No Content (comum no DELETE)
    if (response.status === 204) {
        return null;
    }
    
    // Retorna o JSON para respostas de sucesso (200, 201)
    return response.json();
};

export const getPublicHeaders = (): HeadersInit => {
    return {
        'Content-Type': 'application/json',
    };
};