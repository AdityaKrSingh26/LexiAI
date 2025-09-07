import { Navigate } from 'react-router-dom';
import { isAuthenticated, getAuthToken, getUser } from './auth';

const ProtectedRoute = ({ children }) => {
    const token = getAuthToken();
    const user = getUser();
    
    // Enhanced authentication check
    if (!isAuthenticated() || !token || !user) {
        console.warn('🚫 Access denied - redirecting to login');
        console.log('Token exists:', !!token);
        console.log('User exists:', !!user);
        return <Navigate to="/login" replace />;
    }

    // Basic token format validation
    if (!token.includes('.')) {
        console.error('🚫 Invalid token format - redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }

    console.log('✅ Authentication successful');
    return children;
};

export default ProtectedRoute;