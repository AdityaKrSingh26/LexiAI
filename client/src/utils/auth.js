export const getAuthToken = () => localStorage.getItem('token');

export const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

/**
 * Decode JWT expiry from the payload (client-side only, no signature verification).
 * Returns true if the token is not yet expired.
 */
const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) return false; // no expiry = treat as valid
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true; // malformed token → treat as expired
    }
};

export const isAuthenticated = () => {
    const token = getAuthToken();
    const user = getUser();
    
    if (!token || !user) return false;
    
    // Verify JWT format (3 parts separated by dots)
    if (token.split('.').length !== 3) {
        console.warn('⚠️ Invalid token format');
        return false;
    }

    // Check token expiry client-side
    if (isTokenExpired(token)) {
        console.warn('⚠️ Token has expired');
        logout();
        return false;
    }
    
    return true;
};