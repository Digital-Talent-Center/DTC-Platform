import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import AuthLayout from '@/layouts/auth-layout';

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword?: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    
    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <AuthLayout>
            <Head title="Log in" />
            
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sm:p-10 text-center">
                    {/* Logo & Welcome text */}
                    <div className="mb-8 flex flex-col items-center">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                            <img src="/images/logo-stacked.png" alt="Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-sm text-gray-500">Sign in to your Digital Talent Centre account</p>
                    </div>

                    {status && <div className="mb-4 text-sm font-medium text-green-600">{status}</div>}

                    <form onSubmit={submit} className="text-left flex flex-col gap-5">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-[10px] font-bold tracking-wider text-gray-500 mb-2 uppercase">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                <input 
                                    id="email" type="email" required placeholder="you@example.com"
                                    value={data.email} onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all" 
                                />
                            </div>
                            {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-[10px] font-bold tracking-wider text-gray-500 mb-2 uppercase">Password</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input 
                                    id="password" type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                                    value={data.password} onChange={(e) => setData('password', e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all tracking-wider" 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        {showPassword ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        ) : (
                                            <>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>
                            {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password}</span>}
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={data.remember} onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                                />
                                <span className="text-xs font-medium text-gray-600">Remember me</span>
                            </label>
                            {canResetPassword && (
                                <Link href={route('password.request')} className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <button type="submit" disabled={processing} className="w-full mt-2 bg-[#ea660b] hover:bg-[#d65c09] text-white font-semibold py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-70">
                            {processing ? 'Signing In...' : 'Sign In'}
                        </button>

                        <div className="relative flex items-center py-2 mt-2">
                            <div className="flex-grow border-t border-gray-100"></div>
                            <span className="flex-shrink-0 mx-4 text-[10px] text-gray-400 font-medium uppercase tracking-widest">OR</span>
                            <div className="flex-grow border-t border-gray-100"></div>
                        </div>

                        <button type="button" className="w-full flex items-center justify-center gap-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl transition-all shadow-sm">
                            <svg viewBox="0 0 24 24" className="w-4 h-4">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>
                    </form>
                </div>
                
                <p className="text-center mt-6 text-xs text-gray-500 font-medium">
                    Don't have an account?{' '}
                    <Link href={route('register')} className="text-amber-600 font-bold hover:text-amber-700 transition-colors">
                        Sign Up
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
