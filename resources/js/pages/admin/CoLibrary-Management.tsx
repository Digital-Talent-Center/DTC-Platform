import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';

interface DocItem {
    id: number;
    title: string;
    description: string | null;
    type: string | null;
    category: string | null;
    competition: string | null;
    level: string | null;
    year: number | null;
    file_path: string | null;
    tags: string[];
    views_count: number;
    downloads_count: number;
    created_at?: string;
}

interface Props {
    initialDocuments: DocItem[];
    total: number;
}

const emptyForm = { title: '', description: '', type: 'resource', category: 'co-library', competition: '', level: '', year: '', tags: '' };

function LevelBadge({ level }: { level: string | null }) {
    if (!level) return <span className="text-gray-400 text-xs">-</span>;
    const cls = level === 'beginner' ? 'bg-blue-100 text-blue-700'
        : level === 'intermediate' ? 'bg-amber-100 text-amber-700'
        : 'bg-red-100 text-red-700';
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide capitalize ${cls}`}>{level}</span>;
}

export default function CoLibraryManagement({ initialDocuments, total }: Props) {
    const [documents, setDocuments] = useState<DocItem[]>(initialDocuments || []);
    const [visibleCount, setVisibleCount] = useState(8);

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState(emptyForm);
    const [file, setFile] = useState<File | null>(null);
    const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
    const [creating, setCreating] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<number | null>(null);

    useEffect(() => { setDocuments(initialDocuments); }, [initialDocuments]);

    const visibleDocuments = documents.slice(0, visibleCount);

    const openCreate = () => {
        setCreateForm(emptyForm);
        setFile(null);
        setCreateErrors({});
        setCreateModalOpen(true);
    };

    const closeCreate = () => {
        setCreateModalOpen(false);
        setCreateForm(emptyForm);
        setFile(null);
        setCreateErrors({});
    };

    const handleCreate = () => {
        setCreating(true);
        router.post(route('admin.library.store'), { ...createForm, file }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => closeCreate(),
            onError: (errors) => setCreateErrors(errors),
            onFinish: () => setCreating(false),
        });
    };

    const handleView = (doc: DocItem) => {
        if (!doc.file_path) { alert('File belum tersedia untuk dokumen ini.'); return; }
        window.open(doc.file_path, '_blank');
    };

    const confirmDelete = (id: number) => {
        setDocToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (docToDelete === null) return;
        router.delete(route('admin.library.destroy', docToDelete), {
            preserveScroll: true,
            onSuccess: () => {
                setDocuments(prev => prev.filter(d => d.id !== docToDelete));
                setDeleteModalOpen(false);
                setDocToDelete(null);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Manajemen Co-Library" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-2 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                            Kembali ke Dashboard
                        </Link>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Manajemen Co-Library</h1>
                    </div>

                    <button onClick={openCreate} className="bg-[#7b5b00] hover:bg-[#634900] text-white font-semibold py-2.5 px-6 rounded-full flex items-center gap-2 transition-colors cursor-pointer shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Tambah Co-Library
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white w-full rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full table-fixed text-sm">
                            <thead>
                                <tr className="bg-[#fbbf24]">
                                    <th className="text-left w-[38%] px-8 py-4 text-gray-900 font-bold text-xs uppercase tracking-wider">Judul</th>
                                    <th className="text-left w-[16%] px-8 py-4 text-gray-900 font-bold text-xs uppercase tracking-wider">Tipe</th>
                                    <th className="text-left w-[16%] px-8 py-4 text-gray-900 font-bold text-xs uppercase tracking-wider">Level</th>
                                    <th className="text-left w-[16%] px-8 py-4 text-gray-900 font-bold text-xs uppercase tracking-wider">Unduhan</th>
                                    <th className="text-left w-[14%] px-8 py-4 text-gray-900 font-bold text-xs uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {visibleDocuments.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-4">
                                            <p className="font-bold text-gray-900 line-clamp-1">{doc.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{doc.category || 'co-library'}</p>
                                        </td>
                                        <td className="px-8 py-4 text-gray-600 text-sm capitalize">{doc.type || '-'}</td>
                                        <td className="px-8 py-4"><LevelBadge level={doc.level} /></td>
                                        <td className="px-8 py-4 text-gray-500 text-sm">{doc.downloads_count} unduhan</td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => handleView(doc)} className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer" title="Lihat File">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => confirmDelete(doc.id)} className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {documents.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-16 text-center text-gray-500 font-medium">
                                            Belum ada Co-Library. Klik "Tambah Co-Library" untuk membuat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer: count + Show More */}
                    {documents.length > 0 && (
                        <div className="px-8 py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-gray-500 font-medium">
                                Menampilkan {Math.min(visibleCount, documents.length)} dari {total} dokumen
                            </p>
                            {visibleCount < documents.length && (
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 8)}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-full hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm cursor-pointer"
                                >
                                    Show More
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {createModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-[34rem] w-full shadow-xl overflow-hidden">
                        <div className="bg-[#7b5b00] px-6 py-4">
                            <h3 className="text-lg font-bold text-white tracking-tight">Tambah Co-Library</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1 col-span-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Judul</label>
                                <input type="text" value={createForm.title} onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Judul dokumen" />
                                {createErrors.title && <p className="text-xs text-red-500">{createErrors.title}</p>}
                            </div>
                            <div className="flex flex-col gap-1 col-span-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Deskripsi</label>
                                <textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                                    rows={3} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Deskripsi singkat" />
                                {createErrors.description && <p className="text-xs text-red-500">{createErrors.description}</p>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipe</label>
                                <input type="text" value={createForm.type} onChange={e => setCreateForm(f => ({ ...f, type: e.target.value }))}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="mis. resource" />
                                {createErrors.type && <p className="text-xs text-red-500">{createErrors.type}</p>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kompetisi</label>
                                <input type="text" value={createForm.competition} onChange={e => setCreateForm(f => ({ ...f, competition: e.target.value }))}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="mis. ICPC (opsional)" />
                                {createErrors.competition && <p className="text-xs text-red-500">{createErrors.competition}</p>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Level</label>
                                <select value={createForm.level} onChange={e => setCreateForm(f => ({ ...f, level: e.target.value }))}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 capitalize cursor-pointer">
                                    <option value="">Pilih level</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                                {createErrors.level && <p className="text-xs text-red-500">{createErrors.level}</p>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tahun</label>
                                <input type="number" value={createForm.year} onChange={e => setCreateForm(f => ({ ...f, year: e.target.value }))}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="mis. 2024" />
                                {createErrors.year && <p className="text-xs text-red-500">{createErrors.year}</p>}
                            </div>
                            <div className="flex flex-col gap-1 col-span-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tags (pisahkan koma)</label>
                                <input type="text" value={createForm.tags} onChange={e => setCreateForm(f => ({ ...f, tags: e.target.value }))}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="struktur-data, ringkasan" />
                                {createErrors.tags && <p className="text-xs text-red-500">{createErrors.tags}</p>}
                            </div>
                            <div className="flex flex-col gap-1 col-span-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">File PDF</label>
                                <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] ?? null)}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-amber-700 file:font-semibold cursor-pointer" />
                                {createErrors.file && <p className="text-xs text-red-500">{createErrors.file}</p>}
                            </div>
                        </div>
                        <div className="px-6 pb-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                            <button onClick={closeCreate} className="px-5 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer text-sm">Batal</button>
                            <button onClick={handleCreate} disabled={creating}
                                className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#7b5b00] hover:bg-[#634900] transition-colors cursor-pointer text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                                {creating && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-gray-100">
                        <div className="flex items-start gap-4 mb-5">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Hapus Co-Library?</h3>
                                <p className="text-sm font-medium text-gray-500 mt-1.5 leading-relaxed">Tindakan ini tidak dapat dibatalkan. File yang terunggah juga akan dihapus.</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                            <button onClick={() => { setDeleteModalOpen(false); setDocToDelete(null); }}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer text-sm">Batal</button>
                            <button onClick={handleDelete}
                                className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm cursor-pointer text-sm">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
