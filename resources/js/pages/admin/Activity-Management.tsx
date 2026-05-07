"use client";

import { useState } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Trash2, Info, ChevronDown, ClipboardList } from "lucide-react";

// Dummy Data Generation
const generateDummyReports = (count: number) => {
    const names = ["Rahmat Hidayat", "Agus", "Ahmad", "Siti", "Budi", "Larasati", "Dian", "Eko", "Putri", "Rizky"];
    return Array.from({ length: count }).map((_, i) => ({
        id: i + 1,
        user: names[i % names.length],
        // Use pravatar for a photo-like avatar to match design
        avatarUrl: `https://i.pravatar.cc/150?u=${i + 100}`,
        reason: "DILAPORKAN",
        content: "Konten ini mengandung kata-kata yang tidak pantas dan menyalahi aturan komunitas yang telah ditetapkan. Mohon segera ditindaklanjuti.",
    }));
};

const initialReports = generateDummyReports(24);

export default function ReportListPage() {
    const [reports, setReports] = useState(initialReports);
    const [visibleCount, setVisibleCount] = useState(6);

    const pendingCount = reports.length;

    const handleDelete = (id: number) => {
        setReports(prev => prev.filter(report => report.id !== id));
    };

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 6);
    };

    return (
        <AppLayout>
            <Head title="Manajemen Aktivitas" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manajemen Aktivitas</h1>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200/60 rounded-xl">
                        <ClipboardList className="w-4 h-4 text-emerald-700" />
                        <span className="text-sm font-bold text-gray-700">{pendingCount} Pending Reports</span>
                    </div>
                </div>

                {/* Report Grid */}
                {reports.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 font-medium">Tidak ada laporan aktivitas yang pending.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reports.slice(0, visibleCount).map((report) => (
                                <div key={report.id} className="bg-[#F8F9FA] p-8 rounded-sm flex flex-col h-full relative group">
                                    
                                    {/* Card Header: Avatar & Name */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                            <img src={report.avatarUrl} alt={report.user} className="w-full h-full object-cover grayscale" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-[15px]">{report.user}</h3>
                                            <div className="flex items-center gap-1 mt-0.5 text-[#C23B22]">
                                                <Info className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">{report.reason}</span>
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
                                            className="w-10 h-10 rounded-full bg-[#C23B22] text-white flex items-center justify-center hover:bg-red-800 transition-colors shadow-sm cursor-pointer"
                                            title="Hapus Laporan"
                                        >
                                            <Trash2 className="w-[18px] h-[18px]" />
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
        </AppLayout>
    );
}
