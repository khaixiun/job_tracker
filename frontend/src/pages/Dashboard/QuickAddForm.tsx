import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {jobFormSchema, type JobFormInput, type JobFormOutput} from '../../schemas/job';
import api from '../../services/api';

interface QuickAddFormProps{
    onSuccess: () => void;
}

interface InputFieldConfig {
    name: 'companyName' | 'jobTitle' | 'salary' | 'location' | 'jobUrl';
    label: string;
    placeholder: string;
    type?: string;
    required?: boolean;
}

const FORM_ROWS: Array<Array<InputFieldConfig>> = [
    [
        {name: 'companyName', label: 'Company Name *', placeholder: 'e.g. Anthropic', required: true},
        {name: 'jobTitle', label:'Job Title *', placeholder: 'e.g. Staff Engineer', required: true}
    ],
    [
        {name: 'salary', label: 'Salary (Optional)', placeholder: 'e.g. RM 8,000' },
        {name: 'location', label: 'Location (Optional)', placeholder: 'e.g. Mid Valley, KL' }
    ],
    [
        {name: 'jobUrl', label: 'Job Posting URL (Optional)', placeholder: 'https://linkedin.com/jobs/view/...', type: 'text' }
    ]
];

export default function QuickAddForm({onSuccess} : QuickAddFormProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error'; text: string} | null>(null);

    const {register, handleSubmit, reset, formState: {errors} } = useForm<JobFormInput, any, JobFormOutput >({
        resolver: zodResolver(jobFormSchema),
        defaultValues: {
            companyName: '',
            jobTitle: '',
            salary: '',
            location: '',
            jobUrl: '',
            status: 'pending'
        }
    });

    const onSubmit = async (data: JobFormOutput) => {
        setMessage(null);
        setLoading(true);

        try{
            await api.post('/jobs', data);
            setMessage({type: 'success', text:'Application added successfully'});
            reset();
            onSuccess();
        } catch (err:any){
            console.error("Quick Add Error: ", err);
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Failed to add application.'
            });
        } finally {
            setLoading(false);
        }
    }

    return(
        <section className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-400 text-sm font-bold">+</span>
                Quick Add Application
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {FORM_ROWS.map((row, rowIndex) => (
                    <div 
                        key = {rowIndex}
                        className={row.length > 1 ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}    
                    >
                        {row.map((field) => (
                            <div key= {field.name} className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    {field.label}
                                </label>
                                <input
                                    type= {field.type || 'text'}
                                    placeholder={field.placeholder}
                                    {...register(field.name)}
                                    className="w-full bg-[#161b2c] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500/50 transition-all"
                                />
                                {errors[field.name] && (
                                    <span className="text-[10px] text-rose-400">
                                        {errors[field.name]?.message}
                                    </span>
                                )}
                            </div> 
                        ))}
                    </div>
                ))}

                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Application Status</label>
                    <select
                        {...register('status')}
                        className="w-full bg-[#161b2c] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500/50 transition-all"
                    >
                        <option value="pending">Pending(Applied)</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offered">Offered</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {message && (
                    <p className={`text-[11px] font-medium mt-2 ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {message.text}
                    </p>
                )}
                
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-800/40 text-white font-semibold text-xs py-2.5 rounded-xl mt-2 cursor-pointer transition-all flex items-center justify-center"
                >
                    {loading ? 'Adding...' : '+ Add Application'}
                </button>
            </form>
        </section>
    );
}
