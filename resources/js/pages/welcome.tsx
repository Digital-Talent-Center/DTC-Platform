import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { type SharedData } from '@/types';

const CAROUSEL_IMAGES = [
    "/images/slide1.jpg",
    "/images/slide2.jpg",
    "/images/slide3.jpg"
];

const SLIDE_CAPTIONS = [
    { title: "Inspire Through Creation", sub: "Kolaborasi dan inovasi bersama tim DTC" },
    { title: "Grow Together", sub: "Kembangkan potensi dan raih pencapaian terbaik" },
    { title: "Unleash Your Talent", sub: "Wujudkan ide kreatifmu bersama komunitas digital" },
];

/* ─── Animated counter hook ─── */
function useCountUp(target: number, duration = 2000, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let frame: number;
        const startTime = performance.now();
        const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.floor(eased * target));
            if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [target, duration, start]);
    return count;
}

/* ─── Intersection observer hook ─── */
function useInView(threshold = 0.2) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

/* ─── Stat Card ─── */
function StatCard({ value, suffix, label, delay, started }: { value: number; suffix: string; label: string; delay: number; started: boolean }) {
    const count = useCountUp(value, 2000, started);
    return (
        <div
            className="text-center group"
            style={{ animation: started ? `fadeSlideUp 0.6s ${delay}ms ease-out both` : 'none' }}
        >
            <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                {count}{suffix}
            </p>
            <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
        </div>
    );
}

/* ─── Feature Card ─── */
function FeatureCard({ icon, title, description, gradient, delay, inView }: {
    icon: string; title: string; description: string; gradient: string; delay: number; inView: boolean;
}) {
    return (
        <div
            className="group relative bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300"
            style={{ animation: inView ? `fadeSlideUp 0.6s ${delay}ms ease-out both` : 'none', opacity: inView ? undefined : 0 }}
        >
            <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [currentSlide, setCurrentSlide] = useState(0);
    const [heroLoaded, setHeroLoaded] = useState(false);
    const statsSection = useInView(0.3);
    const featuresSection = useInView(0.15);
    const ctaSection = useInView(0.3);

    useEffect(() => {
        setHeroLoaded(true);
    }, []);

    // Auto-advance carousel
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const features = [
        {
            icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
            title: 'Activities Tracking',
            description: 'Dokumentasikan setiap kegiatan dan lacak perkembangan perjalanan akademikmu secara real-time.',
            gradient: 'bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-200/50',
        },
        {
            icon: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721',
            title: 'Achievement Showcase',
            description: 'Tampilkan prestasi dan pencapaianmu. Upload sertifikat dan bukti prestasi untuk diverifikasi.',
            gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200/50',
        },
        {
            icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
            title: 'Co-Library & Co-Guide',
            description: 'Akses koleksi sumber daya digital dan panduan pembelajaran yang telah dikurasi oleh para mentor.',
            gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200/50',
        },
        {
            icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
            title: 'Premium Post',
            description: 'Buat konten unggulan dan tampilkan di beranda. Tingkatkan visibilitas karya terbaikmu.',
            gradient: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-200/50',
        },
        {
            icon: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
            title: 'AI Chatbot',
            description: 'Dapatkan bantuan instant melalui chatbot AI yang siap membantu pertanyaanmu seputar platform.',
            gradient: 'bg-gradient-to-br from-pink-500 to-rose-600 shadow-pink-200/50',
        },
        {
            icon: 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6',
            title: 'Timeline & Analytics',
            description: 'Pantau progresmu melalui timeline interaktif dan analitik yang membantumu terus berkembang.',
            gradient: 'bg-gradient-to-br from-cyan-500 to-sky-600 shadow-cyan-200/50',
        },
    ];

    return (
        <>
            <Head title="Welcome to PRODIGI" />

            {/* ─── Keyframe Animations ─── */}
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeSlideRight {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes pulseGlow {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-float-delayed { animation: float 6s ease-in-out 2s infinite; }
                .shimmer-text {
                    background: linear-gradient(90deg, #f59e0b, #f97316, #ef4444, #f97316, #f59e0b);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 4s linear infinite;
                }
            `}</style>

            <div className="min-h-screen bg-white overflow-x-hidden">

                {/* ════════════════════════════════════════════════════
                    SECTION 1 — HERO
                ════════════════════════════════════════════════════ */}
                <section className="relative min-h-screen flex items-center overflow-hidden">
                    {/* Background Carousel */}
                    <div className="absolute inset-0">
                        {CAROUSEL_IMAGES.map((src, index) => (
                            <div
                                key={src}
                                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                    }`}
                            >
                                <img
                                    src={src}
                                    alt={`Slide ${index + 1}`}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    className="object-cover object-center w-full h-full scale-105"
                                    style={{ animation: index === currentSlide ? 'none' : 'none' }}
                                />
                            </div>
                        ))}
                        {/* Dark overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30 z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-10" />
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-20 right-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl z-10 animate-float" />
                    <div className="absolute bottom-32 left-10 w-56 h-56 bg-orange-500/10 rounded-full blur-3xl z-10 animate-float-delayed" />

                    {/* Navbar */}
                    <nav className="absolute top-0 left-0 right-0 z-30 px-6 sm:px-10 lg:px-16 py-5">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <div
                                className="flex items-center gap-3"
                                style={{ animation: heroLoaded ? 'fadeSlideRight 0.8s ease-out both' : 'none' }}
                            >
                                <img
                                    src="/images/logo-horizontal.png"
                                    alt="PRODIGI"
                                    className="h-8 sm:h-10 w-auto object-contain brightness-0 invert"
                                />
                            </div>
                            <div
                                className="flex items-center gap-3"
                                style={{ animation: heroLoaded ? 'fadeSlideUp 0.6s 200ms ease-out both' : 'none' }}
                            >
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="px-5 py-2.5 bg-white/10 backdrop-blur-md text-white text-sm font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="px-5 py-2.5 text-white/90 text-sm font-semibold hover:text-white transition-colors hidden sm:inline-flex"
                                        >
                                            Masuk
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all hover:-translate-y-0.5"
                                        >
                                            Daftar Sekarang
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </nav>

                    {/* Hero Content */}
                    <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-32 lg:py-0 w-full">
                        <div className="max-w-2xl">
                            <div
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6"
                                style={{ animation: heroLoaded ? 'fadeSlideUp 0.6s 300ms ease-out both' : 'none' }}
                            >
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-xs font-medium text-white/80 tracking-wide">Digital Talent Centre - Telkom University</span>
                            </div>

                            <h1
                                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6"
                                style={{ animation: heroLoaded ? 'fadeSlideUp 0.8s 400ms ease-out both' : 'none' }}
                            >
                                Bangun Masa Depan
                                <br />
                                <span className="shimmer-text">Digital</span>mu
                                <br />
                                Mulai Dari Sini
                            </h1>

                            <p
                                className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 max-w-lg"
                                style={{ animation: heroLoaded ? 'fadeSlideUp 0.8s 550ms ease-out both' : 'none' }}
                            >
                                Platform kolaborasi untuk mahasiswa Telkom University.
                                Dokumentasikan prestasi, akses sumber belajar, dan kembangkan talenta digitalmu bersama komunitas.
                            </p>

                            <div
                                className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
                                style={{ animation: heroLoaded ? 'fadeSlideUp 0.8s 700ms ease-out both' : 'none' }}
                            >
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-base font-bold rounded-2xl shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:-translate-y-0.5 flex items-center gap-3"
                                    >
                                        Masuk ke Dashboard
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-base font-bold rounded-2xl shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:-translate-y-0.5 flex items-center gap-3"
                                        >
                                            Mulai Sekarang
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                            </svg>
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="px-8 py-4 bg-white/10 backdrop-blur-md text-white text-base font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
                                        >
                                            Sudah punya akun? Masuk
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Slide caption + indicators */}
                    <div className="absolute bottom-8 left-6 sm:left-10 lg:left-16 z-20">
                        <div className="flex items-center gap-4">
                            {/* Indicators */}
                            <div className="flex items-center gap-2">
                                {CAROUSEL_IMAGES.map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setCurrentSlide(index)}
                                        aria-label={`Go to slide ${index + 1}`}
                                        className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${currentSlide === index
                                            ? 'w-10 bg-amber-500'
                                            : 'w-3 bg-white/30 hover:bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>
                            {/* Caption */}
                            <div className="hidden sm:block ml-4 pl-4 border-l border-white/20">
                                <p className="text-sm font-semibold text-white/90 transition-all duration-500">
                                    {SLIDE_CAPTIONS[currentSlide].title}
                                </p>
                                <p className="text-xs text-white/50">
                                    {SLIDE_CAPTIONS[currentSlide].sub}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 right-6 sm:right-10 lg:right-16 z-20 hidden md:flex flex-col items-center gap-2">
                        <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] [writing-mode:vertical-lr]">Scroll</span>
                        <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent relative overflow-hidden">
                            <div className="w-full h-4 bg-amber-500 absolute animate-bounce" />
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════
                    SECTION 2 — STATS
                ════════════════════════════════════════════════════ */}
                <section ref={statsSection.ref} className="relative py-20 bg-gradient-to-b from-gray-50 to-white">
                    {/* Decorative top border */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

                    <div className="max-w-5xl mx-auto px-6 sm:px-10">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                            <StatCard value={500} suffix="+" label="Mahasiswa Aktif" delay={0} started={statsSection.inView} />
                            <StatCard value={1200} suffix="+" label="Prestasi Terdaftar" delay={150} started={statsSection.inView} />
                            <StatCard value={50} suffix="+" label="Mentor & Pembimbing" delay={300} started={statsSection.inView} />
                            <StatCard value={30} suffix="+" label="Program Aktif" delay={450} started={statsSection.inView} />
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════
                    SECTION 3 — FEATURES
                ════════════════════════════════════════════════════ */}
                <section ref={featuresSection.ref} className="py-20 sm:py-28 bg-white">
                    <div className="max-w-6xl mx-auto px-6 sm:px-10">
                        {/* Section Header */}
                        <div className="text-center mb-14" style={{ animation: featuresSection.inView ? 'fadeSlideUp 0.6s ease-out both' : 'none', opacity: featuresSection.inView ? undefined : 0 }}>
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold tracking-wider uppercase mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                                </svg>
                                Platform Features
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                                Semua yang Kamu Butuhkan
                            </h2>
                            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
                                PRODIGI menyediakan berbagai fitur untuk mendukung pengembangan talenta digital mahasiswa Telkom University.
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {features.map((feature, i) => (
                                <FeatureCard
                                    key={feature.title}
                                    icon={feature.icon}
                                    title={feature.title}
                                    description={feature.description}
                                    gradient={feature.gradient}
                                    delay={i * 100}
                                    inView={featuresSection.inView}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════
                    SECTION 4 — CTA
                ════════════════════════════════════════════════════ */}
                <section ref={ctaSection.ref} className="py-20 sm:py-28 bg-gradient-to-b from-white to-gray-50">
                    <div className="max-w-4xl mx-auto px-6 sm:px-10">
                        <div
                            className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-10 sm:p-16 text-center overflow-hidden"
                            style={{ animation: ctaSection.inView ? 'fadeSlideUp 0.8s ease-out both' : 'none', opacity: ctaSection.inView ? undefined : 0 }}
                        >
                            {/* Decorative blobs */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" style={{ animation: 'pulseGlow 4s ease-in-out infinite' }} />
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" style={{ animation: 'pulseGlow 4s ease-in-out 2s infinite' }} />
                            {/* Grid pattern */}
                            <div className="absolute inset-0 opacity-5"
                                style={{
                                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                    backgroundSize: '24px 24px',
                                }}
                            />

                            <div className="relative z-10">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                    </svg>
                                </div>

                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight">
                                    Siap Memulai Perjalananmu?
                                </h2>
                                <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
                                    Bergabunglah dengan ratusan mahasiswa yang telah mengembangkan talenta digital mereka melalui PRODIGI.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-base font-bold rounded-2xl shadow-xl shadow-amber-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-3"
                                        >
                                            Buka Dashboard
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                            </svg>
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('register')}
                                                className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-base font-bold rounded-2xl shadow-xl shadow-amber-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-3"
                                            >
                                                Daftar Sekarang
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                </svg>
                                            </Link>
                                            <Link
                                                href={route('login')}
                                                className="px-8 py-4 text-white/70 hover:text-white text-base font-semibold transition-colors"
                                            >
                                                Sudah punya akun? →
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════
                    SECTION 5 — FOOTER
                ════════════════════════════════════════════════════ */}
                <footer className="bg-gray-50 border-t border-gray-200">
                    <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            {/* Left */}
                            <div className="flex items-center gap-4 text-center md:text-left">
                                <img
                                    src="/images/logo-stacked.png"
                                    alt="PRODIGI"
                                    width={48}
                                    height={48}
                                    className="h-10 w-auto object-contain hidden sm:block"
                                />
                                <div>
                                    <p className="text-sm font-bold tracking-tight text-gray-900">Digital Talent Centre</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        © {new Date().getFullYear()} PRODIGI — Inspire Through Creation. All Rights Reserved.
                                    </p>
                                </div>
                            </div>
                            {/* Right */}
                            <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                                {[
                                    { label: 'Privacy Policy', href: '/privacy-policy' },
                                    { label: 'Terms of Service', href: '/terms-of-service' },
                                    { label: 'Help Center', href: '/help-center' },
                                    { label: 'Contact Us', href: '/contact-us' },
                                ].map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="text-xs font-medium text-gray-400 tracking-wider uppercase hover:text-amber-600 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
