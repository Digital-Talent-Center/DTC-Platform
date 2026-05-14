import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';

interface AchievementData {
    id: number;
    title: string;
    user: string;
    major: string;
    file: string;
    fileSize: string;
    uploadedAt: string;
}

interface Props {
    initialAchievements: AchievementData[];
    initialPendingCount: number;
    initialApprovedCount: number;
}

export default function AchievementManagement({ initialAchievements, initialPendingCount, initialApprovedCount }: Props) {
    const [achievements, setAchievements] = useState<AchievementData[]>(initialAchievements || []);
    const [approvedCount, setApprovedCount] = useState(initialApprovedCount || 0);
    const [pendingCount, setPendingCount] = useState(initialPendingCount || 0);
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const handleApprove = (id: number) => {
        if (loadingId !== null) return;
        setLoadingId(id);
        router.patch(route('admin.achievements.updateStatus', id), { status: 'approved' }, {
            preserveScroll: true,
            onSuccess: () => {
                setAchievements(prev => prev.filter(a => a.id !== id));
                setApprovedCount(prev => prev + 1);
                setPendingCount(prev => Math.max(0, prev - 1));
            },
            onError: () => alert('Gagal menyetujui pencapaian. Silakan coba lagi.'),
            onFinish: () => setLoadingId(null),
        });
    };

    const handleReject = (id: number) => {
        if (loadingId !== null) return;
        setLoadingId(id);
        router.patch(route('admin.achievements.updateStatus', id), { status: 'rejected' }, {
            preserveScroll: true,
            onSuccess: () => {
                setAchievements(prev => prev.filter(a => a.id !== id));
                setPendingCount(prev => Math.max(0, prev - 1));
            },
            onError: () => alert('Gagal menolak pencapaian. Silakan coba lagi.'),
            onFinish: () => setLoadingId(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Manajemen Pencapaian" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Manajemen Pencapaian</h1>

                    {/* Badges */}
                    <div className="flex items-center gap-3 mt-4 sm:mt-0">
                        <div className="bg-gray-200/80 px-4 py-2 rounded-full flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                            <span className="text-sm font-bold text-gray-700">{pendingCount} Pending</span>
                        </div>
                        <div className="bg-gray-200/80 px-4 py-2 rounded-full flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                            <span className="text-sm font-bold text-gray-700">{approvedCount} Approved</span>
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((achievement) => (
                        <div key={achievement.id} className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col">

                            {/* Icon Trophy */}
                            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-5 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3v5.25a4.5 4.5 0 01-9 0V3M12 16.5v5.25m-3 0h6M5.25 4.5h13.5c.828 0 1.5.672 1.5 1.5v3.75a6.75 6.75 0 01-13.5 0V6c0-.828.672-1.5 1.5-1.5z" />
                                </svg>
                            </div>

                            {/* Title & Info */}
                            <h3 className="text-[17px] font-bold text-gray-900 leading-tight mb-1.5">{achievement.title}</h3>
                            <p className="text-sm font-medium text-gray-500 mb-6">{achievement.user} - {achievement.major}</p>

                            {/* Attachment Box */}
                            <div className="bg-gray-100/70 rounded-2xl p-4 flex items-start gap-4 mb-6">
                                <div className="text-gray-400 mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-gray-800">{achievement.file}</p>
                                    <p className="text-[11px] font-semibold text-gray-400 mt-0.5">{achievement.fileSize} • {achievement.uploadedAt}</p>
                                </div>
                            </div>

                            {/* Spacer to push buttons to bottom if height varies */}
                            <div className="mt-auto"></div>

                            {/* Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleReject(achievement.id)}
                                    disabled={loadingId !== null}
                                    className="py-3 px-4 rounded-full border-[1.5px] border-red-200 text-red-600 font-bold text-sm tracking-wide hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loadingId === achievement.id ? (
                                        <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                    ) : 'Reject'}
                                </button>
                                <button
                                    onClick={() => handleApprove(achievement.id)}
                                    disabled={loadingId !== null}
                                    className="py-3 px-4 rounded-full bg-[#f6931c] text-white font-bold text-sm tracking-wide hover:bg-[#e08418] transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loadingId === achievement.id ? (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : 'Approve'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State (Optional) */}
                {achievements.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg font-medium">Semua pencapaian telah diproses.</p>
                    </div>
                )}


            </div>
        </AppLayout>
    );
}
