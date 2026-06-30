import {useMemo} from 'react';

interface MetricCardsProps {
    data:{
        totalApplication : number;
        activeInterviews : number;
        offersReceived : number;
        rejectionRate : number;
    } | null;
}

export default function MetricCards({data} : MetricCardsProps) {
    const statsList = useMemo(() => {
        const formattedRejectionRate = data !== null ? `${data.rejectionRate}%` : '0%';
        
        return [
            { title: 'Total Application', value: data?.totalApplication ?? 0 },
            { title: 'Active Interviews', value: data?.activeInterviews ?? 0 },
            { title: 'Offers Received', value: data?.offersReceived ?? 0 },
            { title: 'Rejection Rate', value: formattedRejectionRate },
        ];
    }, [data]);

    return(
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {statsList.map ((stat) => {
                return(
                    <section
                        key={stat.title}
                        className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700/60 transition-all duration-300"
                    >
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold tracking-tight text-white">{stat.value}</h3>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-blue-500/10 to-transparent group-hover:via-blue-500/30 transition-all" />
                    </section>
                )
            })}
        </div>
    )
}