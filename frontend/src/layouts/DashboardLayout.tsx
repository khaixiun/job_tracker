import {Outlet, Link, useLocation} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {Briefcase, LayoutDashboard, FolderKanban, BarChart3, LogOut} from 'lucide-react';

const navItems = [
    {name: 'Dashboard', path: '/', icon: LayoutDashboard },
    {name: 'Job Board', path: '/jobs', icon: FolderKanban },
    {name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

export default function DashboardLayout(){
    const {user, logout} = useAuth();
    const location = useLocation();

    return(
        <div className= "flex h-screen w-screen overflow-hidden bg-[#0b0f19]">
            <aside className="w-64 border-r border-slate-800 bg-[#0f1422] flex flex-col justify-between p-4 shrink-0">
                <div className="space-y-8">
                    {/* Brand Logo Header */}
                    <div className="flex items-center gap-2 px-2 py-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <Briefcase className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-white tracking-wider">JobTrack</span>
                    </div>
                    
                    {/* Nav Items Link List */}
                    <nav className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-2">Navigation</p>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                                        isActive
                                        ? 'bg-blue-600/10 text-blue-400'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                    }`}
                                >
                                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    {item.name}
                                    {isActive && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                {/* User Mini Profile Foot Card Footer panel */}
                <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between px-1">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm shrink-0">
                            {user?.username?.substring(0,2).toUpperCase() ?? '?'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-white truncate">{user?.username ?? '?'}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user?.email ?? '?'}</p>
                        </div> 
                    </div>
                    <button
                        onClick={logout}
                        title="Sign Out"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors ml-2"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </aside>
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}