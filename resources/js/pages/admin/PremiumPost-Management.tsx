import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';

interface PremiumPost {
    id: number;
    title: string;
    user: string;
    posting_date: string;
    expired_date: string;
    status: string;
    amount: number;
    attachment_path: string | null;
    created_at: string;
}

interface Props {
    initialPosts: PremiumPost[];
    total: number;
}

function StatusBadge({ status }: { status: string }) {
    if (!status) return <span className="text-gray-400 text-xs">-</span>;
    const isPaid = status === 'paid' || status === 'settlement' || status === 'capture';
    const isPending = status === 'pending';
    const cls = isPaid ? 'bg-green-100 text-green-700'
        : isPending ? 'bg-amber-100 text-amber-700'
        : 'bg-red-100 text-red-700';
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide capitalize ${cls}`}>{status}</span>;
}

export default function PremiumPostManagement({ initialPosts, total }: Props) {
    const [posts, setPosts] = useState<PremiumPost[]>(initialPosts || []);
    const [visibleCount, setVisibleCount] = useState(8);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<number | null>(null);

    useEffect(() => { setPosts(initialPosts); }, [initialPosts]);

    const visiblePosts = posts.slice(0, visibleCount);

    const confirmDelete = (id: number) => {
        setPostToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (postToDelete === null) return;
        router.delete(route('admin.premium-posts.destroy', postToDelete), {
            preserveScroll: true,
            onSuccess: () => {
                setPosts(prev => prev.filter(p => p.id !== postToDelete));
                setDeleteModalOpen(false);
                setPostToDelete(null);
            },
        });
    };

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    }

    return (
        <AppLayout>
            <Head title="Manajemen Premium Post" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-2 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                            Kembali ke Dashboard
                        </Link>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Manajemen Premium Post</h1>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white w-full rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full table-fixed text-sm">
                            <thead>
                                <tr className="bg-[#fbbf24]">
                                    <th className="text-left w-[30%] px-8 py-4 text-gray-900 font-bold text-xs uppercase tracking-wider">Judul & Pembuat</th>
                                    <th className="text-left w-[15%] px-8 py-4 text-gray-900 font-bold text-xs uppercase tracking-wider">Status</th>
                                    <th className="text-left w-[15%] px-8 py-4 text-gray-900 font-bold text-xs uppercase tracking-wider">Tanggal Expired</th>
                                    <th className="text-left w-[20%] px-8 py-4 text-gray-900 font-bold text-xs uppercase tracking-wider">Harga</th>
                                    <th className="text-left w-[20%] px-8 py-4 text-gray-900 font-bold text-xs uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {visiblePosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-4">
                                            <p className="font-bold text-gray-900 line-clamp-1">{post.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">oleh {post.user}</p>
                                        </td>
                                        <td className="px-8 py-4"><StatusBadge status={post.status} /></td>
                                        <td className="px-8 py-4">
                                            <p className="text-gray-700 font-medium text-sm">{post.posting_date}</p>
                                            <p className="text-red-500 font-semibold text-xs mt-0.5">s/d {post.expired_date}</p>
                                        </td>
                                        <td className="px-8 py-4 text-gray-700 font-medium">{formatRupiah(post.amount)}</td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => confirmDelete(post.id)} className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer" title="Hapus">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {posts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-16 text-center text-gray-500 font-medium">
                                            Belum ada transaksi Premium Post.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer: count + Show More */}
                    {posts.length > 0 && (
                        <div className="px-8 py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-gray-500 font-medium">
                                Menampilkan {Math.min(visibleCount, posts.length)} dari {total} premium post
                            </p>
                            {visibleCount < posts.length && (
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
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Hapus Premium Post?</h3>
                                <p className="text-sm font-medium text-gray-500 mt-1.5 leading-relaxed">Tindakan ini tidak dapat dibatalkan. Data transaksi dan file gambar yang terunggah juga akan ikut terhapus secara permanen.</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                            <button onClick={() => { setDeleteModalOpen(false); setPostToDelete(null); }}
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
