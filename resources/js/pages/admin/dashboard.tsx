"use client";
import { useState } from "react";
import { Link, Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";

interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    major: string;
    nim: string;
    status: string;
}

const ROLE_OPTIONS = ['student', 'admin'];

interface AchievementData {
    id: number;
    title: string;
    by: string;
    icon: string;
}

interface ReportData {
    id: number;
    user: string;
    avatar: string;
    reason: string;
    content: string;
}

interface DashboardProps {
    totalStudents: number;
    totalApprovedAchievements: number;
    totalActiveReports: number;
    recentUsers: UserData[];
    recentAchievements: AchievementData[];
    recentReports: ReportData[];
}

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

function RoleBadge({ role }: { role: string }) {
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide capitalize ${role === "admin" ? "bg-[#fde68a] text-[#7b5b00]" : "bg-gray-100 text-gray-700"}`}>
            {role}
        </span>
    );
}

/* ─── Main Page ─── */
export default function AdminDashboardPage({ totalStudents, totalApprovedAchievements, totalActiveReports, recentUsers, recentAchievements, recentReports }: DashboardProps) {
    const [users, setUsers] = useState<UserData[]>(recentUsers || []);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [achievements, setAchievements] = useState<AchievementData[]>(recentAchievements || []);
    const [reports, setReports] = useState<ReportData[]>(recentReports || []);
    const [loadingAchievementId, setLoadingAchievementId] = useState<number | null>(null);

    const emptyEditForm = { name: '', email: '', password: '', password_confirmation: '', nim: '', major: '', role: 'student' };
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState(emptyEditForm);
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    function confirmDeleteUser(id: number) {
        setUserToDelete(id);
        setDeleteModalOpen(true);
    }

    function openEditUser(user: UserData) {
        setEditingId(user.id);
        setEditForm({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            nim: user.nim === 'N/A' ? '' : user.nim,
            major: user.major === 'N/A' ? '' : user.major,
            role: user.role,
        });
        setEditErrors({});
        setEditModalOpen(true);
    }

    function closeEditModal() {
        setEditModalOpen(false);
        setEditingId(null);
        setEditForm(emptyEditForm);
        setEditErrors({});
    }

    function handleUpdateUser() {
        if (editingId === null) return;
        setSaving(true);
        router.put(route('admin.students.update', editingId), editForm, {
            preserveScroll: true,
            onSuccess: () => {
                setUsers(prev => {
                    if (editForm.role === 'admin') {
                        return prev.filter(u => u.id !== editingId);
                    }
                    return prev.map(u => u.id === editingId
                        ? { ...u, name: editForm.name, email: editForm.email, role: editForm.role, nim: editForm.nim || 'N/A', major: editForm.major || 'N/A' }
                        : u);
                });
                closeEditModal();
            },
            onError: (errors) => setEditErrors(errors),
            onFinish: () => setSaving(false),
        });
    }

    function handleDeleteUser() {
        if (userToDelete === null) return;
        router.delete(route('admin.students.destroy', userToDelete), {
            preserveScroll: true,
            onSuccess: () => {
                setUsers(prev => prev.filter(u => u.id !== userToDelete));
                setDeleteModalOpen(false);
                setUserToDelete(null);
            },
        });
    }

    function handleApprove(id: number) {
        if (loadingAchievementId !== null) return;
        setLoadingAchievementId(id);
        router.patch(route('admin.achievements.updateStatus', id), { status: 'approved' }, {
            preserveScroll: true,
            onSuccess: () => setAchievements(prev => prev.filter(a => a.id !== id)),
            onError: () => alert('Gagal menyetujui pencapaian.'),
            onFinish: () => setLoadingAchievementId(null),
        });
    }

    function handleReject(id: number) {
        if (loadingAchievementId !== null) return;
        setLoadingAchievementId(id);
        router.patch(route('admin.achievements.updateStatus', id), { status: 'rejected' }, {
            preserveScroll: true,
            onSuccess: () => setAchievements(prev => prev.filter(a => a.id !== id)),
            onError: () => alert('Gagal menolak pencapaian.'),
            onFinish: () => setLoadingAchievementId(null),
        });
    }

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
                        label="Total Mahasiswa" value={totalStudents?.toLocaleString() || "0"} color="bg-amber-50"
                    />
                    <StatCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        label="Achievement Baru" value={totalApprovedAchievements?.toLocaleString() || "0"} color="bg-green-50"
                    />
                    <StatCard
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
                        label="Laporan Aktif" value={totalActiveReports?.toLocaleString() || "0"} color="bg-red-50"
                    />
                </div>

                {/* ── User Management ── */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Manajemen Pengguna</h2>
                    </div>
                    <div className="overflow-x-auto min-h-[220px]">
                        <table className="w-full text-sm table-fixed">
                            <thead>
                                <tr className="bg-amber-500">
                                    <th className="w-[28%] text-left px-6 py-3 text-white font-semibold text-xs uppercase tracking-wider">Nama</th>
                                    <th className="w-[22%] text-left px-6 py-3 text-white font-semibold text-xs uppercase tracking-wider">NIM / ID</th>
                                    <th className="w-[16%] text-left px-6 py-3 text-white font-semibold text-xs uppercase tracking-wider">Role</th>
                                    <th className="w-[16%] text-left px-6 py-3 text-white font-semibold text-xs uppercase tracking-wider">Status</th>
                                    <th className="w-[18%] text-left px-6 py-3 text-white font-semibold text-xs uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.length > 0 ? users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{user.major}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{user.nim}</td>
                                        <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                                        <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => router.visit(route('profile.show.user', user.id))} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Lihat">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                </button>
                                                <button onClick={() => openEditUser(user)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                                                </button>
                                                <button onClick={() => confirmDeleteUser(user.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">Tidak ada data pengguna</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-50 flex justify-center">
                        <Link href="/admin/students" className="text-sm text-gray-500 hover:text-amber-600 font-medium flex items-center gap-1.5 transition-colors">
                            Lihat Semua Data
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                        </Link>
                    </div>
                </section>

                {/* ── Delete User Confirmation Modal ── */}
                {deleteModalOpen && (
                    <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5 animate-in zoom-in duration-200">
                            <div className="flex flex-col items-center gap-3 text-center">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Hapus Pengguna</h3>
                                    <p className="text-sm text-gray-500 mt-1">Apakah Anda yakin ingin menghapus pengguna ini? Semua data terkait akan ikut terhapus dan tidak dapat dikembalikan.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setDeleteModalOpen(false); setUserToDelete(null); }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                                >
                                    Ya, Hapus Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Edit User Modal ── */}
                {editModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-gray-900/40 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl max-w-[34rem] w-full shadow-xl overflow-hidden">
                            {/* Modal Header */}
                            <div className="bg-[#7b5b00] px-6 py-4">
                                <h3 className="text-lg font-bold text-white tracking-tight">Edit Mahasiswa</h3>
                            </div>
                            {/* Modal Body */}
                            <div className="p-6 grid grid-cols-2 gap-4">
                                {/* Nama */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        placeholder="Nama lengkap"
                                    />
                                    {editErrors.name && <p className="text-xs text-red-500">{editErrors.name}</p>}
                                </div>
                                {/* NIM */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">NIM</label>
                                    <input
                                        type="text"
                                        value={editForm.nim}
                                        onChange={e => setEditForm(f => ({ ...f, nim: e.target.value }))}
                                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        placeholder="NIM mahasiswa"
                                    />
                                    {editErrors.nim && <p className="text-xs text-red-500">{editErrors.nim}</p>}
                                </div>
                                {/* Email */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        placeholder="email@example.com"
                                    />
                                    {editErrors.email && <p className="text-xs text-red-500">{editErrors.email}</p>}
                                </div>
                                {/* Major */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Jurusan</label>
                                    <input
                                        type="text"
                                        value={editForm.major}
                                        onChange={e => setEditForm(f => ({ ...f, major: e.target.value }))}
                                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        placeholder="Program studi"
                                    />
                                    {editErrors.major && <p className="text-xs text-red-500">{editErrors.major}</p>}
                                </div>
                                {/* Role */}
                                <div className="flex flex-col gap-1 col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</label>
                                    <select
                                        value={editForm.role}
                                        onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 capitalize cursor-pointer"
                                    >
                                        {ROLE_OPTIONS.map(r => (
                                            <option key={r} value={r} className="capitalize">{r}</option>
                                        ))}
                                    </select>
                                    {editForm.role === 'admin' && (
                                        <p className="text-xs text-amber-600">Akun dengan role admin tidak akan tampil di daftar Manajemen Pengguna.</p>
                                    )}
                                    {editErrors.role && <p className="text-xs text-red-500">{editErrors.role}</p>}
                                </div>
                                {/* Password */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
                                    <input
                                        type="password"
                                        value={editForm.password}
                                        onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        placeholder="Kosongkan jika tidak diubah"
                                    />
                                    {editErrors.password && <p className="text-xs text-red-500">{editErrors.password}</p>}
                                </div>
                                {/* Confirm Password */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Konfirmasi Password</label>
                                    <input
                                        type="password"
                                        value={editForm.password_confirmation}
                                        onChange={e => setEditForm(f => ({ ...f, password_confirmation: e.target.value }))}
                                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        placeholder="Kosongkan jika tidak diubah"
                                    />
                                </div>
                            </div>
                            {/* Modal Footer */}
                            <div className="px-6 pb-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                                <button
                                    onClick={closeEditModal}
                                    className="px-5 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleUpdateUser}
                                    disabled={saving}
                                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#7b5b00] hover:bg-[#634900] transition-colors cursor-pointer text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                    Simpan Perubahan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Activity Management ── */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Manajemen Aktivitas</h2>
                        {reports.length > 0 && (
                            <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                                {reports.length}
                            </span>
                        )}
                    </div>
                    <div className="p-6">
                        <div className="min-h-[220px] flex flex-col justify-center">
                        {reports.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-sm font-medium">Tidak ada laporan aktivitas yang aktif</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {reports.map((report) => (
                                    <div key={report.id} className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {report.avatar}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{report.user}</p>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                                                    {report.reason}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed flex-1 line-clamp-3">{report.content}</p>
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                            <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">SENSITIF</span>
                                            <button
                                                onClick={() => {
                                                    router.delete(route('admin.reports.destroy', report.id), {
                                                        preserveScroll: true,
                                                        onSuccess: () => setReports(prev => prev.filter(r => r.id !== report.id)),
                                                    });
                                                }}
                                                className="ml-auto p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" title="Hapus"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        </div>
                        <div className="mt-5 flex justify-center">
                            <Link href="/admin/activities" className="text-sm text-gray-500 hover:text-amber-600 font-medium flex items-center gap-1.5 transition-colors">
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
                        <div className="min-h-[220px] flex flex-col justify-center">
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
                                            <button
                                                onClick={() => handleApprove(achievement.id)}
                                                disabled={loadingAchievementId !== null}
                                                className="px-4 py-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                            >
                                                {loadingAchievementId === achievement.id
                                                    ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    : 'Setujui'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(achievement.id)}
                                                disabled={loadingAchievementId !== null}
                                                className="px-4 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                            >
                                                {loadingAchievementId === achievement.id
                                                    ? <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                    : 'Tolak'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        </div>
                        <div className="mt-5 flex justify-center">
                            <Link href="/admin/achievements" className="text-sm text-gray-500 hover:text-amber-600 font-medium flex items-center gap-1.5 transition-colors">
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
