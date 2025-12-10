const API_BASE = 'http://localhost:3000';

export async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const fetchOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };
    
    try {
        const response = await fetch(url, fetchOptions);
        
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch {
                errorMessage = response.statusText || errorMessage;
            }
            
            throw new Error(errorMessage);
        }
        
        return await response.json();
        
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('No se pudo conectar con el servidor.');
        }
        throw error;
    }
}

export const api = {
    get: (endpoint, options = {}) => 
        apiRequest(endpoint, { ...options, method: 'GET' }),
    
    post: (endpoint, data, options = {}) =>
        apiRequest(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        }),
    
    delete: (endpoint, options = {}) =>
        apiRequest(endpoint, { ...options, method: 'DELETE' })
};