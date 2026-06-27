import { createBrowserRouter, Navigate} from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import Dashboard from '../pages/Dashboard';
import {PrivateRoutes, PublicRoutes} from './routeGuards';

export const router = createBrowserRouter([
    {
        element: <PublicRoutes />,
        children: [
            {path: '/login', element: <AuthPage />}
        ]
    },
    {
        element: <PrivateRoutes />,
        children: [
            {path: '/', element: <Dashboard />}
        ]
    },
    {
        path: '*',
        element: <Navigate to ='/' replace/>
    }
]);
