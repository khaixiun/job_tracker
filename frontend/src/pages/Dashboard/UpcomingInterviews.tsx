import {Video, Calendar, Clock} from 'lucide-react';

export interface InterviewItem {
    interviewId: number;
    interviewType: string;
    scheduledAt: string;
    meetingLink: string | null;
    notes: string | null;
    companyName?: string;
    jobTitle?: string;
}

interface UpcomingInterviewProps{
    interviews: InterviewItem[];
}

const getAvatarStyle = (name: string) => {
    const code = name.trim().charAt(0).toUpperCase().charCodeAt(0);
    if(isNaN(code)) return 'bg-slate-800 text-slate-400 border-slate-700/50';
    if(code % 4 === 0) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if(code % 4 === 1) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if(code % 4 === 2) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function UpcomingInterview({interviews = []} : UpcomingInterviewProps) {
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        let hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2,'0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes} ${ampm}`
    }

    return(
        <section className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-base font-bold text-white">Upcoming Interview</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">All scheduled sessions</p>
                </div>
                <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {interviews.length} Scheduled
                </span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-105 pr-1 scrollbar-thin">
                {interviews.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-800/60 rounded-xl text-xs text-slate-600">
                        No upcoming interviews scheduled yet.
                    </div>
                ) : (
                    interviews.map((item) => {
                        const company = item.companyName ?? 'Company';
                        const title = item.jobTitle ?? 'Position';
                        return (
                            <div 
                                key={item.interviewId} 
                                className="flex items-center justify-between p-3 rounded-xl border border-slate-900 bg-[#121727]/40 hover:bg-[#121727]/90 hover:border-slate-800/50 transition-all duration-200"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className={`h-11 w-11 rounded-xl border flex items-center justify-center font-bold text-sm tracking-tight ${getAvatarStyle(company)}`}>
                                        {company.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-white tracking-tight">{company}</h3>
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md tracking-wide bg-slate-800/80 text-slate-300 border border-slate-700/50">
                                            {item.interviewType}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{title}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right text-xs font-medium space-y-1">
                                        <div className="text-slate-300 font-semibold flex items-center justify-end gap-1.5">
                                            <Calendar size={12} className="text-slate-500" />
                                            {formatDate(item.scheduledAt)}
                                        </div>

                                        <div className="text-slate-500 text-[11px] flex items-center justify-end gap-1.5">
                                            <Clock size={12} />
                                            {formatTime(item.scheduledAt)}
                                        </div>   
                                    </div>
                                
                                {item.meetingLink ? (
                                    <a href={item.meetingLink}
                                       target = "_blank"
                                       rel = "noreferrer"
                                       className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-blue-900/20 active:scale-[0.98]"
                                    >
                                        <Video size={13} />
                                        Join
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="bg-slate-800/40 text-slate-600 font-medium text-xs px-4 py-2 rounded-xl cursor-not-allowed"
                                    >
                                        No Link
                                    </button>   
                                )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}