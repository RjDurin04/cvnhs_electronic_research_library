import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminStore } from '@/store/adminStore';

export const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAdminStore();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login, preserving the intended destination
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <Outlet />;
};
