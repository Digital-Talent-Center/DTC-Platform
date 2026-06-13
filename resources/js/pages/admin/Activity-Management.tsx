"use client";

import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Trash2, Info, ChevronDown, ClipboardList } from "lucide-react";

// ── Tipe data laporan dari database ──────────────────────────────────────────
interface ReportItem {
    id: number;
    user: string;
    userId: number | null;
    avatar: string;
    reason: string;
    content: string;
    status: string;
    post_id: number | null;
    created_at: string;
}

interface PaginatedReports {
    data: ReportItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    initialReports: PaginatedReports;
    pendingCount: number;
}

// ── Komponen utama ─────────────────────────────────────────────────────────────
export default function ReportListPage({ initialReports, pendingCount }: Props) {
    const [reports, setReports] = useState<ReportItem[]>(initialReports?.data ?? []);
    const [visibleCount, setVisibleCount] = useState(6);
    const [deleting, setDeleting] = useState<number | null>(null);

    // ── Hapus laporan via Inertia (DELETE ke server) ──────────────────────────
    const handleDelete = (id: number) => {
        if (deleting !== null) return; // cegah double-klik
        setDeleting(id);

        router.delete(route("admin.reports.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                // Hapus dari state lokal supaya UI langsung update
                setReports((prev) => prev.filter((r) => r.id !== id));
            },
            onError: () => {
                alert("Gagal menghapus laporan. Silakan coba lagi.");
            },
            onFinish: () => setDeleting(null),
        });
    };

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 6);
    };

    const visibleReports = reports.slice(0, visibleCount);

    return (
        <AppLayout>
            <Head title="Manajemen Aktivitas" />

            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex flex-col">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manajemen Aktivitas</h1>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200/60 rounded-xl">
                        <ClipboardList className="w-4 h-4 text-emerald-700" />
                        <span className="text-sm font-bold text-gray-700">{pendingCount} Pending Reports</span>
                    </div>
                </div>

                {/* Report Grid */}
                <div className="flex-1">
                {reports.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 font-medium">Tidak ada laporan aktivitas yang pending.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {visibleReports.map((report) => (
                                <div
                                    key={report.id}
                                    className="bg-[#F8F9FA] p-8 rounded-sm flex flex-col h-full relative group"
                                >
                                    {/* Card Header: Avatar & Name */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
                                            {report.userId ? (
                                                <Link href={`/profile/${btoa('user_' + report.userId)}`} className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-400 to-slate-600 text-white text-sm font-bold hover:opacity-90 transition-opacity">
                                                    {report.avatar}
                                                </Link>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-400 to-slate-600 text-white text-sm font-bold">
                                                    {report.avatar}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-[15px]">
                                                {report.userId ? (
                                                    <Link href={`/profile/${btoa('user_' + report.userId)}`} className="hover:text-amber-600 hover:underline">
                                                        {report.user}
                                                    </Link>
                                                ) : (
                                                    report.user
                                                )}
                                            </h3>
                                            <div className="flex items-center gap-1 mt-0.5 text-[#C23B22]">
                                                <Info className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                                    {report.reason}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <p className="text-[13px] text-gray-500 leading-relaxed mb-8 flex-grow pr-4">
                                        {report.content}
                                    </p>

                                    {/* Action Button */}
                                    <div className="flex justify-end mt-auto">
                                        <button
                                            onClick={() => handleDelete(report.id)}
                                            disabled={deleting === report.id}
                                            className="w-10 h-10 rounded-full bg-[#C23B22] text-white flex items-center justify-center hover:bg-red-800 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Hapus Laporan"
                                        >
                                            {deleting === report.id ? (
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 className="w-[18px] h-[18px]" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Load More Button */}
                        {visibleCount < reports.length && (
                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-full hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm cursor-pointer"
                                >
                                    Load More Reports
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
                </div>

            </div>
        </AppLayout>
    );
}
