import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {useNavigate} from 'react-router-dom';
import {zodResolver} from '@hookform/resolvers/zod';
import {useAuth} from '../context/AuthContext';
import api from '../services/api';
import {Eye, EyeOff, Briefcase} from 'lucide-react';
import {
    loginSchema,
    registerSchema,
    type LoginFormData,
    type RegisterFormData,
} from '../schemas/auth';

export default function AuthPage(){
    const {login: saveSessionToGlobalState} = useAuth();
    const navigate = useNavigate();
    const [isLoginView, setIsLoginView] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {email: '', password: ''}
    });

    const registerForm = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {username: '', email: '', password: '', confirmPassword: ''}
    });

    const onLoginSubmit = async (data: LoginFormData) => {
        try{
            setServerError(null);
            const response = await api.post('auth/login', data);
            const {token, user} = response.data;
            saveSessionToGlobalState(token, user);
            navigate('/', {replace: true});
        } catch (error: any){
            setServerError(error.response?.data?.message || 'Invalid email or password.');
        }
    };

    const onRegisterSubmit = async (data:RegisterFormData) => {
        try{
            setServerError(null);
            const backendPayload = {
                username: data.username,
                email: data.email,
                password: data.password
            };
            const response = await api.post('/auth/register', backendPayload);
            const {token, user} = response.data;
            saveSessionToGlobalState(token, user);
            setIsLoginView(true);
        } catch(error: any) {
            setServerError(error.response?.data?.message || 'Registration failed');
        }
    };

    const toggleView = () => {
        setServerError(null);
        loginForm.reset();
        registerForm.reset();
        setIsLoginView(!isLoginView);
    };

    return(
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12"> 
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                
                <div className="flex items-center gap-2 mb-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white">
                            <Briefcase className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-slate-900">JobTracker</span>
                </div>

                <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200/60 mb-6">
                    <button 
                        type="button" 
                        onClick={() => !isLoginView && toggleView()}
                        className={`w-1/2 rounded-md py-1.5 text-sm font-medium transition-all 
                        ${isLoginView ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900 '}`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => isLoginView && toggleView()}
                        className={`w-1/2 rounded-md py-1.5 text-sm font-medium transition-all 
                        ${!isLoginView ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Create Account
                    </button>
                </div>

                <div className="mb-6 space-y-1">
                    <h2 className= "text-2xl font-bold tracking-tight text-slate-900">
                        {isLoginView ? 'Welcome Back' : 'Create your account'}
                    </h2>
                    <p className="text-sm text-slate-500">
                        {isLoginView ? 'Sign in to continue to JobTracker.' : 'Start tracking your career pipeline today.'}
                    </p>
                </div>

                {serverError &&(
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                        {serverError}
                    </div>
                )}

                <form onSubmit={isLoginView ? loginForm.handleSubmit(onLoginSubmit) : registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    {/* Registration-Only Full Name Field */}
                    {!isLoginView && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                {...registerForm.register('username')}
                                placeholder="Alex Johnson"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-950 transition colors" 
                            />
                            {registerForm.formState.errors.username && (
                                <p className="mt-1 text-xs text-red-500">{registerForm.formState.errors.username.message}</p>
                            )}
                        </div>
                    )}

                    {/* Shared Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input 
                            type="email"
                            {...(isLoginView ? loginForm.register('email') : registerForm.register('email'))}
                            placeholder="alex@example.com"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-950 transition-colors"
                        />
                        {(isLoginView ? loginForm.formState.errors.email : registerForm.formState.errors.email) && (
                            <p className="mt-1 text-xs text-red-500">
                                {isLoginView ? loginForm.formState.errors.email?.message : registerForm.formState.errors.email?.message}
                            </p>
                        )}
                    </div>

                    {/* Shared Password Field */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            {isLoginView && <a href='#' className="text-xs font-medium text-slate-600 hover:underline">Forgot password?</a>}
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...(isLoginView ? loginForm.register('password') : registerForm.register('password'))}
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-slate-200 bg-white pl-3 pr-10 py-2.5 text-sm outline-none focus:border-slate-950 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {(isLoginView ? loginForm.formState.errors.password : registerForm.formState.errors.password) && (
                            <p className="mt-1 text-xs text-red-500">
                                {isLoginView ? loginForm.formState.errors.password?.message : registerForm.formState.errors.password?.message}
                            </p>
                        )}
                    </div>

                    {/* Registration-Only Confirm Password Field */}
                    {!isLoginView && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...registerForm.register('confirmPassword')}
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-950 transition-colors"
                            />
                            {registerForm.formState.errors.confirmPassword &&(
                                <p className="mt-1 text-xs text-red-500">{registerForm.formState.errors.confirmPassword?.message}</p>
                            )}
                        </div>
                    )}

                    {/* Dark Primary Action Button */}
                    <button
                        type="submit"
                        disabled={isLoginView ? loginForm.formState.isSubmitting : registerForm.formState.isSubmitting}
                        className="w-full rounded-lg bg-slate-950 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
                    >
                        {isLoginView
                            ? (loginForm.formState.isSubmitting ? 'Signing In...' : 'Sign In')
                            : (registerForm.formState.isSubmitting ? 'Creating Account...' : 'Sign Up')}
                    </button>
                </form>

                <div className="text-center text-sm text-slate-500 mt-6">
                    {isLoginView ? "Don't have an account? " : "Already have an account?"}
                    <button onClick={toggleView} className="font-semibold text-slate-950 hover:underline">
                        {isLoginView ? 'Sign up' : 'Sign in'}
                    </button>
                </div>
            </div>
        </div>
    )
}

