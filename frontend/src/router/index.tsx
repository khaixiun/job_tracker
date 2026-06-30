import { createBrowserRouter, Navigate} from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import Dashboard from '../pages/Dashboard/index';
import DashboardLayout from '../layouts/DashboardLayout';
import {PrivateRoutes, PublicRoutes} from './routeGuards';

// Placeholder components for your other views
const JobBoardPlaceholder = () => <div className="text-white p-6">💼 Job Board Page Coming Soon!</div>;
const AnalyticsPlaceholder = () => <div className="text-white p-6">📊 Analytics Page Coming Soon!</div>;

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
            {
                element: <DashboardLayout />,
                children: [
                    { path: '/', element: <Dashboard />},
                    { path: '/jobs', element: <JobBoardPlaceholder />},
                    { path: '/analytics', element: <AnalyticsPlaceholder />},
                ]
            }
        ]
    },
    {
        path: '*',
        element: <Navigate to ='/' replace/>
    }
]);
