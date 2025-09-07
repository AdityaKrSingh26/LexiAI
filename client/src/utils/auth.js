export const getAuthToken = () => localStorage.getItem('token');

export const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const isAuthenticated = () => {
    const token = getAuthToken();
    const user = getUser();
    
    // Basic validation
    if (!token || !user) {
        return false;
    }
    
    // Check if token has proper JWT format (3 parts separated by dots)
    if (token.split('.').length !== 3) {
        console.warn('⚠️ Invalid token format');
        return false;
    }
    
    return true;
};

// Validate and refresh token if needed
export const validateToken = async () => {
    const token = getAuthToken();
    if (!token) return false;
    
    try {
        const response = await fetch('/api/auth/validate', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            logout();
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Token validation failed:', error);
        logout();
        return false;
    }
};