import {z} from 'zod';

export const jobFormSchema = z.object({
    companyName: z
        .string()
        .min(1, 'Company name is required')
        .trim(),
    jobTitle : z
        .string()
        .min(1, 'Job title is required')
        .trim(),
    salary: z
        .string()
        .transform(val => val.trim() || null),
    location: z
        .string()
        .transform(val => val.trim() || null),
    jobUrl: z
        .string()
        .url('Must be a valid URL')
        .or(z.literal(''))
        .transform(val => val || null),
    status: z
        .enum(['pending', 'interviewing', 'offered', 'rejected']),
});

export type JobFormInput = z.input<typeof jobFormSchema>; 
export type JobFormOutput = z.output<typeof jobFormSchema>;