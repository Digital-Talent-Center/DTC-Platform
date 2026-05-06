"use client";
import { useState } from "react";
import { Link, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";

/* ─── Dummy Data ─── */
const users = [
    { id: 1, name: "Ahmad Rizky", major: "Informatika", nim: "2024100105", status: "ACTIVE" },
    { id: 2, name: "Siti Aminah", major: "Teknologi Informasi", nim: "2024100289", status: "ACTIVE" },
    { id: 3, name: "Budi Santoso", major: "Data Sains", nim: "2024100313", status: "SUSPENDED" },
    { id: 4, name: "Larasati Putri", major: "Data Sains", nim: "2024100456", status: "ACTIVE" },
    { id: 5, name: "Dian Tanujaya", major: "Teknologi Informasi", nim: "2024100521", status: "SUSPENDED" },
];

const reportedActivities = [
    { id: 1, user: "Rahmat Hidayat", avatar: "RH", avatarColor: "from-slate-400 to-slate-600", reason: "DILAPORKAN", content: "Konten ini mengandung kata-kata yang tidak pantas dan...", sensitive: true },
    { id: 2, user: "Agus", avatar: "AG", avatarColor: "from-slate-400 to-slate-600", reason: "DILAPORKAN", content: "Konten ini mengandung kata-kata yang tidak pantas dan...", sensitive: true },
    { id: 3, user: "Ahmad", avatar: "AH", avatarColor: "from-slate-400 to-slate-600", reason: "DILAPORKAN", content: "Konten ini mengandung kata-kata yang tidak pantas dan...", sensitive: true },
];

const pendingAchievements = [
    { id: 1, title: "Hackathon Winner", by: "Budi", icon: "🏆" },
    { id: 2, title: "Juara KRBAi", by: "Budi", icon: "🏆" },
    { id: 3, title: "Juara Gemastik KTI", by: "Arrijal", icon: "🏆" },
    { id: 4, title: "Juara Gemastik Game Development", by: "Yudhistira", icon: "🏆" },
];

/* ─── Sub-Components ─── */
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-0.5">{value}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const isActive = status === "ACTIVE";
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
            {status}
        </span>
    );
}

/* ─── Main Page ─── */
export default function AdminDashboardPage() {
    const [achievements, setAchievements] = useState(pendingAchievements);

    function handleApprove(id: number) { setAchievements((prev) => prev.filter((a) => a.id !== id)); }
    function handleReject(id: number) { setAchievements((prev) => prev.filter((a) => a.id !== id)); }

    return (
        <AppLayout>
            <Head title="Admin Dashboard" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

                {/* ── Page Title ── */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                    <p className="mt-2 text-gray-500">Kelola pengguna, aktivitas, dan pencapaian platform.</p>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <StatCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>}
                        label="Total Mahasiswa" value="12,840" color="bg-amber-50"
                    />
                    <StatCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        label="Achievement Baru" value="342" color="bg-green-50"
                    />
                    <StatCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
                        label="Laporan Aktif" value="18" color="bg-red-50"
                    />
                </div>

                {/* ── User Management ── */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Manajemen Pengguna</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-amber-500">
                                    <th className="text-left px-6 py-3 text-white font-semibold text-xs uppercase tracking-wider">Nama</th>
                                    <th className="text-left px-6 py-3 text-white font-semibold text-xs uppercase tracking-wider">NIM / ID</th>
                                    <th className="text-left px-6 py-3 text-white font-semibold text-xs uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-3 text-white font-semibold text-xs uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{user.major}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{user.nim}</td>
                                        <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Lihat">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                </button>
                                                <button className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                                </button>
                                                <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-50 flex justify-center">
                        <Link href="#" className="text-sm text-gray-500 hover:text-amber-600 font-medium flex items-center gap-1.5 transition-colors">
                            Lihat Semua Data
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                        </Link>
                    </div>
                </section>

                {/* ── Activity Management ── */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Manajemen Aktivitas</h2>
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                            Refresh Feed
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reportedActivities.map((activity) => (
                                <div key={activity.id} className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${activity.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{activity.avatar}</div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{activity.user}</p>
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                                                {activity.reason}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed flex-1 line-clamp-3">{activity.content}</p>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                        {activity.sensitive && (
                                            <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">SENSITIF</span>
                                        )}
                                        <button className="ml-auto p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" title="Hapus">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 flex justify-center">
                            <Link href="#" className="text-sm text-gray-500 hover:text-amber-600 font-medium flex items-center gap-1.5 transition-colors">
                                Lihat Semua Laporan
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Achievement Management ── */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Manajemen Pencapaian</h2>
                        {achievements.length > 0 && (
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">{achievements.length}</span>
                        )}
                    </div>
                    <div className="p-6">
                        {achievements.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-sm font-medium">Tidak ada pencapaian yang menunggu persetujuan</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {achievements.map((achievement) => (
                                    <div key={achievement.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl flex-shrink-0">{achievement.icon}</div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{achievement.title}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">oleh {achievement.by}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button onClick={() => handleApprove(achievement.id)} className="px-4 py-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold rounded-lg transition-colors">Setujui</button>
                                            <button onClick={() => handleReject(achievement.id)} className="px-4 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 transition-colors">Tolak</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-5 flex justify-center">
                            <Link href="#" className="text-sm text-gray-500 hover:text-amber-600 font-medium flex items-center gap-1.5 transition-colors">
                                Lihat Semua Permintaan
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                            </Link>
                        </div>
                    </div>
                </section>

            </div>
        </AppLayout>
    );
}
