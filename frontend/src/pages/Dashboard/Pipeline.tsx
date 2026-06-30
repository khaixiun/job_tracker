import {useMemo} from 'react';

interface PipelineOverviewProps {
    pipeline: {
        applied : number;
        interviewing: number;
        offered : number;
        rejected : number;
    } | null;
    successRate : number | null;
}

export default function PipelineOverview({pipeline, successRate} : PipelineOverviewProps) {
    const applied = pipeline?.applied ?? 0;
    const interviewing = pipeline?.interviewing ?? 0;
    const offers = pipeline?.offered ?? 0;
    const rejected = pipeline?.rejected ?? 0;

    const maxCount = Math.max(applied, interviewing, offers, rejected, 1);

    const rows = useMemo(() => [
        {label: 'Applied', count: applied, color: 'bg-blue-500'},
        {label: 'Interviewing', count: interviewing, color: 'bg-purple-500'},
        {label: 'Offers', count: offers, color: 'bg-emerald-500'},
        {label: 'Rejected', count: rejected, color: 'bg-rose-500'},
    ],[applied, interviewing, offers, rejected]);

    return(
        <section className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between h-full">
            <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-6">
                    Pipeline Overview
                </h2>

                <div className="space-y-4">
                    {rows.map((row) => {
                        const barWidth = `${(row.count / maxCount) * 100}%`;
                        return(
                            <div key={row.label} className="flex items-center justify-between text-xs font-medium">
                                <div className="flex items-center gap-2.5 w-28">
                                    <span className={`h-2 w-2 rounded-full ${row.color}`} />
                                    <span className="text-slate-400 text-sm">{row.label}</span>
                                </div>

                                <span className="text-white font-semibold text-right w-8 pr-3">
                                    {row.count}
                                </span>

                                <div className="flex-1 h-1 bg-slate-800/60 rounded-full overflow-hidden relative">
                                    <div className={`h-full ${row.color} rounded-full transition-all duration-500 ease-out`}
                                        style={{width: barWidth}}>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-slate-900 mt-6 pt-4 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Success Rate</span>
                <span className="font-bold text-emerald-400 tracking-tight text-sm">
                    {successRate !== null ? `${successRate}%` : '0%'}
                </span>
            </div>
        </section>
    );
}