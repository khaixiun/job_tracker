import { createBrowserRouter, Navigate} from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import Dashboard from '../pages/Dashboard/index';
import DashboardLayout from '../layouts/DashboardLayout';
import {PrivateRoutes, PublicRoutes} from './routeGuards';
import JobList from '../pages/Jobs/JobsList'

// Placeholder components for your other views
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
                    { path: '/jobs', element: <JobList />},
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
