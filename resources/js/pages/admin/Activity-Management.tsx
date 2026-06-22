"use client";

import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Trash2, Info, ChevronDown, ClipboardList, CheckCircle2, FileText, User } from "lucide-react";

// ── Tipe data laporan dari database ──────────────────────────────────────────
interface ReportItem {
    id: number;
    user: string;           // nama pelapor
    userId: number | null;  // id pelapor
    avatar: string;
    reason: string;
    description: string | null;  // deskripsi dari pelapor
    status: string;
    post_id: number | null;
    post_content: string | null; // isi postingan yang dilaporkan
    post_owner: string | null;   // nama pemilik postingan
    post_owner_id: number | null;
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

// ── Format waktu relatif ────────────────────────────────────────────────────
function formatTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}j lalu`;
    if (diffDays < 7) return `${diffDays}h lalu`;
    return date.toLocaleDateString('id-ID');
}

// ── Komponen utama ─────────────────────────────────────────────────────────────
export default function ReportListPage({ initialReports, pendingCount }: Props) {
    const [reports, setReports] = useState<ReportItem[]>(initialReports?.data ?? []);
    const [visibleCount, setVisibleCount] = useState(6);
    const [actionLoading, setActionLoading] = useState<{ id: number; type: 'dismiss' | 'delete' } | null>(null);

    // ── Abaikan laporan (fake report) — postingan tetap ada ────────────────
    const handleDismiss = (id: number) => {
        if (actionLoading !== null) return;
        if (!confirm('Tandai laporan ini sebagai tidak valid? Postingan akan tetap ada.')) return;

        setActionLoading({ id, type: 'dismiss' });

        router.patch(route("admin.reports.dismiss", id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setReports((prev) => prev.filter((r) => r.id !== id));
            },
            onError: () => {
                alert("Gagal mengabaikan laporan. Silakan coba lagi.");
            },
            onFinish: () => setActionLoading(null),
        });
    };

    // ── Hapus postingan + selesaikan laporan + notifikasi ke pemilik ───────
    const handleDeletePost = (report: ReportItem) => {
        if (actionLoading !== null) return;
        const postPreview = report.post_content
            ? `"${report.post_content.slice(0, 60)}${report.post_content.length > 60 ? '…' : ''}"`
            : 'postingan ini';
        if (!confirm(`Hapus ${postPreview} milik ${report.post_owner ?? 'user'}?\n\nPemilik akan mendapat notifikasi bahwa postingannya dihapus karena melanggar aturan.`)) return;

        setActionLoading({ id: report.id, type: 'delete' });

        router.delete(route("admin.reports.delete-post", report.id), {
            preserveScroll: true,
            onSuccess: () => {
                // Hapus semua laporan terkait post yang sama dari tampilan
                setReports((prev) => prev.filter((r) => r.post_id !== report.post_id));
            },
            onError: () => {
                alert("Gagal menghapus postingan. Silakan coba lagi.");
            },
            onFinish: () => setActionLoading(null),
        });
    };

    const handleLoadMore = () => setVisibleCount((prev) => prev + 6);

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

                {/* Legend */}
                <div className="flex items-center gap-6 mb-6 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span>Abaikan (laporan palsu / tidak valid)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-[#C23B22] flex items-center justify-center">
                            <Trash2 className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span>Hapus postingan &amp; notifikasi pemilik</span>
                    </div>
                </div>

                {/* Report Grid */}
                <div className="flex-1">
                    {reports.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Tidak ada laporan aktivitas yang pending.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visibleReports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col h-full relative group hover:shadow-md transition-shadow duration-200"
                                    >
                                        {/* Card Header: Pelapor */}
                                        <div className="p-5 pb-3">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                                    {report.userId ? (
                                                        <Link
                                                            href={`/profile/${btoa('user_' + report.userId)}`}
                                                            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-400 to-slate-600 text-white text-sm font-bold hover:opacity-90 transition-opacity"
                                                        >
                                                            {report.avatar}
                                                        </Link>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-400 to-slate-600 text-white text-sm font-bold">
                                                            {report.avatar}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Pelapor</p>
                                                    <h3 className="font-bold text-gray-900 text-[14px] truncate">
                                                        {report.userId ? (
                                                            <Link
                                                                href={`/profile/${btoa('user_' + report.userId)}`}
                                                                className="hover:text-amber-600 hover:underline"
                                                            >
                                                                {report.user}
                                                            </Link>
                                                        ) : (
                                                            report.user
                                                        )}
                                                    </h3>
                                                    <div className="flex items-center gap-1 mt-0.5 text-[#C23B22]">
                                                        <Info className="w-3 h-3 flex-shrink-0" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                                                            {report.reason}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">
                                                    {formatTime(report.created_at)}
                                                </span>
                                            </div>

                                            {/* Deskripsi laporan */}
                                            {report.description && (
                                                <p className="text-[12px] text-gray-500 italic leading-relaxed bg-gray-50 rounded-lg px-3 py-2 mb-3 border-l-2 border-gray-200">
                                                    "{report.description}"
                                                </p>
                                            )}
                                        </div>

                                        {/* Divider */}
                                        <div className="mx-5 border-t border-gray-100" />

                                        {/* Postingan yang Dilaporkan */}
                                        <div className="p-5 pt-3 flex-grow">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <FileText className="w-3.5 h-3.5 text-gray-400" />
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Postingan yang Dilaporkan</p>
                                            </div>

                                            {report.post_content ? (
                                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                                                    {/* Pemilik post */}
                                                    {report.post_owner && (
                                                        <div className="flex items-center gap-1.5 mb-2">
                                                            <User className="w-3 h-3 text-amber-600" />
                                                            <span className="text-[11px] font-semibold text-amber-700">
                                                                {report.post_owner_id ? (
                                                                    <Link
                                                                        href={`/profile/${btoa('user_' + report.post_owner_id)}`}
                                                                        className="hover:underline"
                                                                    >
                                                                        {report.post_owner}
                                                                    </Link>
                                                                ) : (
                                                                    report.post_owner
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <p className="text-[12px] text-gray-700 leading-relaxed line-clamp-3">
                                                        {report.post_content}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                                                    <p className="text-[12px] text-gray-400 italic">Postingan sudah dihapus</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="px-5 pb-5 flex items-center justify-end gap-2">
                                            {/* Tombol Abaikan (fake/invalid report) */}
                                            <button
                                                onClick={() => handleDismiss(report.id)}
                                                disabled={actionLoading !== null}
                                                className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                title="Abaikan laporan (laporan tidak valid / fake)"
                                            >
                                                {actionLoading?.id === report.id && actionLoading.type === 'dismiss' ? (
                                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="w-[18px] h-[18px]" />
                                                )}
                                            </button>

                                            {/* Tombol Hapus Postingan */}
                                            <button
                                                onClick={() => handleDeletePost(report)}
                                                disabled={actionLoading !== null || !report.post_content}
                                                className="w-10 h-10 rounded-full bg-[#C23B22] text-white flex items-center justify-center hover:bg-red-800 transition-colors shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                title={report.post_content ? "Hapus postingan & kirim notifikasi ke pemilik" : "Postingan sudah dihapus"}
                                            >
                                                {actionLoading?.id === report.id && actionLoading.type === 'delete' ? (
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
