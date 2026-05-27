import { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';

interface Student {
    id: number;
    name: string;
    major: string;
    nim: string;
    status: string;
}

interface Props {
    students: Student[];
}

export default function StudentManagement({ students: initialStudents }: Props) {
    const [students, setStudents] = useState<Student[]>(initialStudents || []);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("Aktif"); // 'Semua', 'Aktif', 'Suspended'
    const [sortFilter, setSortFilter] = useState("none"); // 'none', 'az', 'za', 'nim_asc', 'nim_desc'
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', password_confirmation: '', nim: '', major: '' });
    const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
    const [creating, setCreating] = useState(false);

    useEffect(() => { setStudents(initialStudents); }, [initialStudents]);

    // Derived state
    const filteredAndSortedStudents = useMemo(() => {
        let result = [...students];

        // Filter by Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.nim.includes(query) ||
                s.major.toLowerCase().includes(query)
            );
        }

        // Filter by Status
        if (statusFilter !== "Semua") {
            const mappedStatus = statusFilter === "Aktif" ? "ACTIVE" : "SUSPENDED";
            result = result.filter(s => s.status === mappedStatus);
        }

        // Sort
        if (sortFilter === "az") {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortFilter === "za") {
            result.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortFilter === "nim_asc") {
            result.sort((a, b) => a.nim.localeCompare(b.nim));
        } else if (sortFilter === "nim_desc") {
            result.sort((a, b) => b.nim.localeCompare(a.nim));
        }

        return result;
    }, [students, searchQuery, statusFilter, sortFilter]);

    const totalItems = filteredAndSortedStudents.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Pagination slicing
    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedStudents.slice(start, start + itemsPerPage);
    }, [filteredAndSortedStudents, currentPage]);

    // Handlers
    const confirmDelete = (id: number) => {
        setStudentToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (studentToDelete === null) return;
        router.delete(route('admin.students.destroy', studentToDelete), {
            preserveScroll: true,
            onSuccess: () => {
                setStudents(prev => prev.filter(s => s.id !== studentToDelete));
                if (paginatedStudents.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                }
                setDeleteModalOpen(false);
                setStudentToDelete(null);
            },
        });
    };

    const handleCreate = () => {
        setCreating(true);
        router.post(route('admin.students.store'), createForm, {
            preserveScroll: true,
            onSuccess: () => {
                setCreateModalOpen(false);
                setCreateForm({ name: '', email: '', password: '', password_confirmation: '', nim: '', major: '' });
                setCreateErrors({});
            },
            onError: (errors) => setCreateErrors(errors),
            onFinish: () => setCreating(false),
        });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to page 1 on search
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortFilter(e.target.value);
        setCurrentPage(1);
    };

    return (
        <AppLayout>
            <Head title="Manajemen Mahasiswa" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Manajemen Mahasiswa</h1>

                    <button onClick={() => setCreateModalOpen(true)} className="bg-[#7b5b00] hover:bg-[#634900] text-white font-semibold py-2.5 px-6 rounded-full flex items-center gap-2 transition-colors cursor-pointer shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Mahasiswa Baru
                    </button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-gray-700"
                            placeholder="Cari berdasarkan nama, NIM, atau departemen..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>

                    {/* Sort Filter */}
                    <div className="relative shrink-0">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </div>
                        <select
                            className="pl-10 pr-10 py-3 bg-white border border-gray-100 rounded-full text-sm font-medium text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer"
                            value={sortFilter}
                            onChange={handleSortChange}
                        >
                            <option value="none">Filter</option>
                            <option value="az">A-Z</option>
                            <option value="za">Z-A</option>
                            <option value="nim_asc">NIM Ascending</option>
                            <option value="nim_desc">NIM Descending</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="relative shrink-0">
                        <select
                            className="pl-5 pr-10 py-3 bg-white border border-gray-100 rounded-full text-sm font-medium text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer"
                            value={statusFilter}
                            onChange={handleStatusChange}
                        >
                            <option value="Semua">Status: Semua</option>
                            <option value="Aktif">Status: Aktif</option>
                            <option value="Suspended">Status: Suspended</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="bg-white w-full rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full table-fixed text-sm">
                            <thead>
                                <tr className="bg-[#fbbf24]">
                                    <th className="text-left w-[35%] px-8 py-4 text-gray-900 font-bold text-xs uppercase tracking-wider">Nama</th>
                                    <th className="text-left w-[25%] px-8 py-4 text-gray-900 font-bold text-xs uppercase tracking-wider">NIM / ID</th>
                                    <th className="text-left w-[20%] px-8 py-4 text-gray-900 font-bold text-xs uppercase tracking-wider">Status</th>
                                    <th className="text-left w-[20%] px-8 py-4 text-gray-900 font-bold text-xs uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-4">
                                            <p className="font-bold text-gray-900">{student.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{student.major}</p>
                                        </td>
                                        <td className="px-8 py-4 text-gray-500 font-mono text-sm tracking-wide">{student.nim}</td>
                                        <td className="px-8 py-4">
                                            {student.status === "ACTIVE" ? (
                                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide bg-[#4ade80] text-gray-900 shadow-sm">
                                                    ACTIVE
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide bg-[#fecaca] text-[#991b1b] shadow-sm">
                                                    SUSPENDED
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <button className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer" title="Lihat Profil">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <button className="text-gray-400 hover:text-amber-600 transition-colors cursor-pointer" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => confirmDelete(student.id)} className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {paginatedStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-16 text-center text-gray-500 font-medium">
                                            Tidak ada data mahasiswa yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {totalItems > 0 && (
                        <div className="px-8 py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-b-[2rem]">
                            <p className="text-sm text-gray-500 font-medium tracking-wide">
                                Menampilkan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} mahasiswa
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                                </button>

                                {/* Simple Pagination Numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                                    if (
                                        totalPages <= 5 ||
                                        pageNum === 1 ||
                                        pageNum === totalPages ||
                                        Math.abs(pageNum - currentPage) <= 1
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-colors ${currentPage === pageNum
                                                    ? "bg-[#7b5b00] text-white shadow-sm"
                                                    : "text-gray-700 hover:bg-gray-100"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    }

                                    if (
                                        (pageNum === 2 && currentPage > 3) ||
                                        (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                                    ) {
                                        return <span key={pageNum} className="px-1 text-gray-400 font-bold tracking-widest">...</span>;
                                    }

                                    return null;
                                })}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Create Student Modal */}
            {createModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-[34rem] w-full shadow-xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-[#7b5b00] px-6 py-4">
                            <h3 className="text-lg font-bold text-white tracking-tight">Tambah Mahasiswa Baru</h3>
                        </div>
                        {/* Modal Body */}
                        <div className="p-6 grid grid-cols-2 gap-4">
                            {/* Nama */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={createForm.name}
                                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="Nama lengkap"
                                />
                                {createErrors.name && <p className="text-xs text-red-500">{createErrors.name}</p>}
                            </div>
                            {/* NIM */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">NIM</label>
                                <input
                                    type="text"
                                    value={createForm.nim}
                                    onChange={e => setCreateForm(f => ({ ...f, nim: e.target.value }))}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="NIM mahasiswa"
                                />
                                {createErrors.nim && <p className="text-xs text-red-500">{createErrors.nim}</p>}
                            </div>
                            {/* Email */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                                <input
                                    type="email"
                                    value={createForm.email}
                                    onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="email@example.com"
                                />
                                {createErrors.email && <p className="text-xs text-red-500">{createErrors.email}</p>}
                            </div>
                            {/* Major */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Jurusan</label>
                                <input
                                    type="text"
                                    value={createForm.major}
                                    onChange={e => setCreateForm(f => ({ ...f, major: e.target.value }))}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="Program studi"
                                />
                                {createErrors.major && <p className="text-xs text-red-500">{createErrors.major}</p>}
                            </div>
                            {/* Password */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
                                <input
                                    type="password"
                                    value={createForm.password}
                                    onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="Min. 8 karakter"
                                />
                                {createErrors.password && <p className="text-xs text-red-500">{createErrors.password}</p>}
                            </div>
                            {/* Confirm Password */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Konfirmasi Password</label>
                                <input
                                    type="password"
                                    value={createForm.password_confirmation}
                                    onChange={e => setCreateForm(f => ({ ...f, password_confirmation: e.target.value }))}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="Ulangi password"
                                />
                            </div>
                        </div>
                        {/* Modal Footer */}
                        <div className="px-6 pb-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                            <button
                                onClick={() => {
                                    setCreateModalOpen(false);
                                    setCreateForm({ name: '', email: '', password: '', password_confirmation: '', nim: '', major: '' });
                                    setCreateErrors({});
                                }}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer text-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={creating}
                                className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#7b5b00] hover:bg-[#634900] transition-colors cursor-pointer text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {creating && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                Buat Akun
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start gap-4 mb-5">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Hapus Data Mahasiswa?</h3>
                                <p className="text-sm font-medium text-gray-500 mt-1.5 leading-relaxed">
                                    Tindakan ini tidak dapat dibatalkan. Data mahasiswa ini akan dihapus secara permanen dari sistem.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setStudentToDelete(null);
                                }}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer text-sm tracking-wide"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm cursor-pointer text-sm tracking-wide"
                            >
                                Ya, Hapus Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
