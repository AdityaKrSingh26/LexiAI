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
    return !!getAuthToken();
};