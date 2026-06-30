import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../../services/api';

interface JobApplication { 
    jobId: number;
    companyName: string;
    jobTitle: string;
    currentStatus: string;
    salary: number | null;
    location: string | null;
}
    
const getStatusStyle = (status: string) => {
    switch(status) {
        case 'Pending': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        case 'Interviewing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'Offered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'Rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        default: return 'bg-slate-800 text-slate-400 border-slate-700/50';
    }
}

export default function JobList() {
    const [jobs, setJobs] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplications = async () =>{
            try{
                setError(null);
                const response = await api.get('/jobs');
                setJobs(response.data);
            } catch (err : any) {
                console.error("Error pulling job applications list: ", err);
                setError(err.response?.data?.message || 'Failed to sync your application tracking board.');
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    if(loading) {
        return (
            <div className="text-xs font-semibold text-slate-500 tracking-wider animate-pulse pt-10">
                LOADING APPLICATION BOARD...
            </div>
        );
    }

    if(error) {
        return (
            <div className="pt-10 flex justify-center">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-5 text-xs text-rose-400 max-w-md text-center font-medium w-full">
                    {error}
                </div>
            </div>
        )
    }

    return(
        <div className="space-y-8 selection:bg-blue-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Applications</h1>
                    <p className="text-xl text-slate-500 mt-0.5">Manage and track your active job applications</p>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-900/20 active:scale-[0.98] self-start sm:self-auto"
                >
                    + Add New Application
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobs.length === 0 ? (
                    <div className="col-span-full border border-dashed border-slate-800/80 rounded-2xl h-44 flex flex-col items-center justify-center text-xs text-slate-600">
                        No job applications added yet. Go to the dashboard to start logging.
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div 
                            key={job.jobId}
                            onClick={() => navigate(`/jobs/${job.jobId}`)}
                            className="bg-[#0f1422] border border-slate-800/60 rounded-2xl p-5 hover:border-slate-700/50 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group flex flex-col justify-between min-h-35"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-white text-lg tracking-tight truncate group-hover:text-blue-400 transition-colors duration-150">
                                            {job.jobTitle}
                                        </h3>
                                        <p className="text-sm text-slate-400 font-medium truncate mt-0.5">
                                            {job.companyName}
                                        </p>
                                    </div>

                                    <span className={`text-sm font-bold px-2.5 py-0.5 border rounded-md tracking-wide shrink-0 ${getStatusStyle(job.currentStatus)}`}>
                                        {job.currentStatus}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 pt-3 border-t border-slate-900/60 flex items-center gap-4 text-sm font-medium text-slate-500">
                                <span className="truncate">{job.location || 'No location'}</span>
                                <span className="truncate">{job.salary ? `RM ${job.salary}` : 'No salary listed'}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}