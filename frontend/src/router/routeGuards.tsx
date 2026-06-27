import {Navigate, Outlet } from 'react-router-dom';
import {useAuth } from '../context/AuthContext';

export function PrivateRoutes(){
    const {user, loading} = useAuth();
    
    if(loading){
        return(
            <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
                Loading session...
            </div>
        );
    }

    if(!user) {
        return <Navigate to="/login" replace />
    }
    return <Outlet />
}

export function PublicRoutes() {
    const {user, loading} = useAuth();

    if(loading) return null;

    if(user){
        return <Navigate to='/' replace />;
    }
    return <Outlet />
}