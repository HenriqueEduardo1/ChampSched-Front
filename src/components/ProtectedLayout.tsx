import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedLayout = () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};