import {useEffect, useState} from 'react';
import api from '../../services/api'

import MetricCard from './MetricCards';
import PipelineOverview from './Pipeline';
import QuickAddForm from './QuickAddForm';
import UpcomingInterview from './UpcomingInterviews';

interface DashboardData {
  totalApplication: number;
  activeInterviews: number;
  offersReceived: number;
  rejectionRate: number;
  successRate: number;
  pipeline: {
    applied: number;
    interviewing: number;
    offered: number; 
    rejected: number;
  } | null;
  upcomingInterviews: any[];
}

export default function Dashboard(){
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardContent = async () => {
        try{
            setError(null);
            const response = await api.get('/summary');
            setDashboardData(response.data);
        } catch (err: any) {
            console.error("Dashboard core fetch error: ", err);
            setError(err.response?.data?.message || 'Failed to sync your dashboard application metrics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardContent();
    }, []);

    if(loading){
        return(
            <div className="min-h-screen bg-[#0a0d1a] flex items-center justify-center text-slate-400 text-xs font-semibold tracking-wide animate-pulse">
                SYNCING APPLICATION METRICS...
            </div>
        );
    }

    if(error) {
        return (
            <div className="min-h-screen bg-[#0a0d1a] flex items-center justify-center p-4">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-5 text-xs text-rose-400 max-w-md text-center font-medium shadow-lg shadow-rose-950/10">
                    {error}
                </div>
            </div>
        );
    }

    const summaryProps = dashboardData ? {
        totalApplication: dashboardData.totalApplication,
        activeInterviews: dashboardData.activeInterviews,
        offersReceived: dashboardData.offersReceived,
        rejectionRate: dashboardData.rejectionRate
    } : null;

    return(
        <main className="min-h-screen bg-[#0a0d1a] p-6 lg:p-10 space-y-8 selection:bg-blue-500/30">
            <MetricCard data={summaryProps} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2">
                    <UpcomingInterview interviews = {dashboardData?.upcomingInterviews ?? []} />
                </div>

                <div className="space-y-6">
                    <QuickAddForm onSuccess={fetchDashboardContent} />
                    
                    <PipelineOverview 
                        pipeline={dashboardData?.pipeline ?? null}
                        successRate={dashboardData?.successRate ?? null} 
                    />
                </div>
            </div>
        </main>
    )
}