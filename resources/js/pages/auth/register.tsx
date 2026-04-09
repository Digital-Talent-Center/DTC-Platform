import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        nim: '',
        faculty: '',
        study_program: '',
        password: '',
        password_confirmation: '',
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <AuthLayout>
            <Head title="Register" />
            
            <div className="w-full max-w-[560px] mx-auto">
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sm:p-10">
                    {/* Logo & Welcome text */}
                    <div className="mb-8 flex flex-col items-center">
                        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-4 text-white shadow-sm shadow-amber-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
                        <p className="text-sm text-gray-500">Join DTC and showcase your achievements</p>
                    </div>

                    <form onSubmit={submit} className="flex flex-col gap-5">
                        {/* FULL NAME */}
                        <div>
                            <label htmlFor="name" className="block text-[10px] font-bold tracking-wider text-gray-500 mb-2 uppercase">Full Name <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                       <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                <input 
                                    id="name" type="text" required placeholder="Enter your full name" autoFocus
                                    value={data.name} onChange={(e) => setData('name', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" 
                                />
                            </div>
                            {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name}</span>}
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label htmlFor="email" className="block text-[10px] font-bold tracking-wider text-gray-500 mb-2 uppercase">Email Address <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                <input 
                                    id="email" type="email" required placeholder="you@example.com"
                                    value={data.email} onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" 
                                />
                            </div>
                            {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* NIM */}
                            <div>
                                <label htmlFor="nim" className="block text-[10px] font-bold tracking-wider text-gray-500 mb-2 uppercase">NIM</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                        </svg>
                                    </span>
                                    <input 
                                        id="nim" type="text" placeholder="1234567890"
                                        value={data.nim} onChange={(e) => setData('nim', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" 
                                    />
                                </div>
                            </div>
                            
                            {/* FACULTY */}
                            <div>
                                <label htmlFor="faculty" className="block text-[10px] font-bold tracking-wider text-gray-500 mb-2 uppercase">Faculty</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </span>
                                    <input 
                                        id="faculty" type="text" placeholder="e.g. Informatika"
                                        value={data.faculty} onChange={(e) => setData('faculty', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* STUDY PROGRAM */}
                        <div>
                            <label htmlFor="study_program" className="block text-[10px] font-bold tracking-wider text-gray-500 mb-2 uppercase">Study Program</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </span>
                                <input 
                                    id="study_program" type="text" placeholder="e.g. S1 Informatika"
                                    value={data.study_program} onChange={(e) => setData('study_program', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* PASSWORD */}
                            <div>
                                <label htmlFor="password" className="block text-[10px] font-bold tracking-wider text-gray-500 mb-2 uppercase">Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </span>
                                    <input 
                                        id="password" type={showPassword ? 'text' : 'password'} required placeholder="Min. 8 characters"
                                        value={data.password} onChange={(e) => setData('password', e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" 
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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

                            {/* CONFIRM PASSWORD */}
                            <div>
                                <label htmlFor="password_confirmation" className="block text-[10px] font-bold tracking-wider text-gray-500 mb-2 uppercase">Confirm Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </span>
                                    <input 
                                        id="password_confirmation" type={showConfirmPassword ? 'text' : 'password'} required placeholder="Repeat password"
                                        value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all tracking-wider" 
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            {showConfirmPassword ? (
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
                            </div>
                        </div>

                        <label className="flex items-start gap-2 mt-2 cursor-pointer group">
                            <input type="checkbox" required className="mt-0.5 w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer" />
                            <span className="text-[11px] text-gray-500 leading-snug">
                                I agree to the <Link href="#" className="font-semibold text-amber-600 hover:underline">Terms of Service</Link> and <Link href="#" className="font-semibold text-amber-600 hover:underline">Privacy Policy</Link>
                            </span>
                        </label>

                        <button type="submit" disabled={processing} className="w-full mt-2 bg-[#ea660b] hover:bg-[#d65c09] text-white font-semibold py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-70">
                            {processing ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>
                </div>
                
                <p className="text-center mt-6 text-xs text-gray-500 font-medium">
                    Already have an account?{' '}
                    <Link href={route('login')} className="text-amber-600 font-bold hover:text-amber-700 transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
