import { Navigate } from 'react-router-dom';
import { isAuthenticated, getAuthToken, getUser } from './auth';

const ProtectedRoute = ({ children }) => {
    const token = getAuthToken();
    const user = getUser();

    // isAuthenticated() checks token presence, user presence, and JWT format
    if (!isAuthenticated() || !token || !user) {
        console.warn('🚫 Access denied - redirecting to login');
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;