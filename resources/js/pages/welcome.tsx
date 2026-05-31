import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { type SharedData } from '@/types';

const CAROUSEL_IMAGES = [
    "/images/slide1.jpg",
    "/images/slide2.jpg",
    "/images/slide3.jpg"
];

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance carousel
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-screen bg-white">
                
                {/* Left Side - Carousel */}
                <div className="hidden lg:flex lg:w-2/3 relative bg-[#efeeeb] overflow-hidden">
                    {CAROUSEL_IMAGES.map((src, index) => (
                        <div
                            key={src}
                            className={`absolute inset-0 transition-opacity duration-700 ${
                                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                        >
                            <img 
                                src={src} 
                                alt={`Slide ${index + 1}`} 
                                loading="lazy"
                                className="object-cover object-center w-full h-full"
                            />
                        </div>
                    ))}
                    
                    {/* Overlays from reference logic */}
                    <div className="absolute inset-0 z-10 opacity-40 bg-[linear-gradient(90deg,rgba(245,244,241,0.90)_0%,rgba(245,244,241,0.78)_40%,rgba(245,244,241,0.45)_63%,rgba(245,244,241,0.05)_100%)] pointer-events-none" />
                    <div className="absolute inset-0 z-10 opacity-50 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.35),transparent_38%)] pointer-events-none" />

                    {/* Carousel Indicators */}
                    <div className="absolute bottom-6 right-5 z-20 flex items-center gap-2 md:bottom-8 md:right-8">
                        {CAROUSEL_IMAGES.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setCurrentSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                className={`h-1.5 w-1.5 rounded-full transition-all cursor-pointer ${
                                    currentSlide === index ? 'bg-white px-6' : 'bg-white/55 hover:bg-white/80'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Side - Login / Register Panel */}
                <div className="w-full lg:w-1/3 flex flex-col relative justify-center px-8 sm:px-12 py-12 bg-white shadow-2xl z-20">
                    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
                        
                        {/* Logo */}
                        <div className="mb-10 flex items-center justify-center">
                            <img
                                src="/images/logo-horizontal.png"
                                alt="PRODIGI"
                                className="h-14 w-auto object-contain"
                            />
                        </div>

                        {/* Welcome Text */}
                        <div className="text-center mb-10">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">
                                Hi, Welcome to PRODIGI
                            </h1>
                            <p className="text-sm text-gray-500">
                                Digital Talent Center Platform
                                <br />
                                Please log in or create a new account to continue
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full flex flex-col gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-amber-200/50 hover:shadow-lg transition-all flex items-center justify-center text-center"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[15px] font-semibold rounded-xl shadow-md shadow-amber-200/50 hover:shadow-lg transition-all flex items-center justify-center text-center"
                                    >
                                        Log In
                                    </Link>
                                    
                                    <div className="relative flex items-center py-2">
                                        <div className="flex-grow border-t border-gray-200"></div>
                                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">
                                            Or
                                        </span>
                                        <div className="flex-grow border-t border-gray-200"></div>
                                    </div>

                                    <Link
                                        href={route('register')}
                                        className="w-full py-3.5 px-4 bg-white border-2 border-gray-200 text-gray-700 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 text-[15px] font-semibold rounded-xl transition-all duration-200 flex items-center justify-center text-center"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>

                    </div>
                    
                    {/* Footer Links (like the image) */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 text-xs text-gray-400 font-medium">
                        <button className="hover:text-amber-600 transition-colors flex items-center gap-1">
                            English (en)
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <a href="#" className="hover:text-amber-600 transition-colors">
                            Cookies notice
                        </a>
                    </div>
                </div>

            </div>
        </>
    );
}
