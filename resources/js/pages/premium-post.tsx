import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, FormEvent, DragEvent } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { SharedData } from '@/types';

type Duration = '7-hari' | '1-bulan' | '3-bulan';
type PaymentMethod = 'virtual-account' | 'e-wallet' | 'kartu-kredit';
type PaymentStatus = 'idle' | 'success' | 'pending' | 'error';

interface DurationOption {
  id: Duration;
  label: string;
  price: number;
  popular?: boolean;
}

const durationOptions: DurationOption[] = [
  { id: '7-hari',  label: '7 Hari',   price: 49000 },
  { id: '1-bulan', label: '1 Bulan',  price: 149000, popular: true },
  { id: '3-bulan', label: '3 Bulan',  price: 399000 },
];

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  iconPath: string;
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'virtual-account',
    label: 'Virtual Account',
    iconPath:
      'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z',
  },
  {
    id: 'e-wallet',
    label: 'E-Wallet (OVO/Gopay)',
    iconPath:
      'M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3',
  },
  {
    id: 'kartu-kredit',
    label: 'Kartu Kredit',
    iconPath:
      'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
  },
];

const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

const TAX_RATE = 0.11;

// Type declaration untuk Midtrans Snap global yang diload dari CDN
declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess: (result: Record<string, unknown>) => void;
          onPending: (result: Record<string, unknown>) => void;
          onError:   (result: Record<string, unknown>) => void;
          onClose:   () => void;
        }
      ) => void;
    };
  }
}

function getCsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export default function PremiumPostPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { auth } = usePage<SharedData>().props;

  const [judul,         setJudul]         = useState('');
  const [deskripsi,     setDeskripsi]     = useState('');
  const [file,          setFile]          = useState<File | null>(null);
  const [filePreview,   setFilePreview]   = useState<string | null>(null);
  const [uploadedPath,  setUploadedPath]  = useState<string | null>(null);
  const [uploading,     setUploading]     = useState(false);
  const [dragActive,    setDragActive]    = useState(false);
  const [duration,      setDuration]      = useState<Duration>('1-bulan');
  const [payment,       setPayment]       = useState<PaymentMethod>('e-wallet');
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [submitting,    setSubmitting]    = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const snapUrl = import.meta.env.VITE_MIDTRANS_SNAP_URL as string;

  // Inject Midtrans Snap.js script sekali saja
  useEffect(() => {
    if (!snapUrl || document.getElementById('midtrans-snap-script')) return;
    const script = document.createElement('script');
    script.id  = 'midtrans-snap-script';
    script.src = snapUrl;
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY ?? '');
    document.head.appendChild(script);
  }, [snapUrl]);

  const selectedDuration = durationOptions.find((d) => d.id === duration) ?? durationOptions[1];
  const subtotal = selectedDuration.price;
  const tax      = Math.round(subtotal * TAX_RATE);
  const total    = subtotal + tax;

  // ─── Upload file ke server, simpan path & preview ───────────────────────────
  const handleFile = async (incoming: File | null) => {
    if (!incoming) {
      setFile(null);
      setFilePreview(null);
      setUploadedPath(null);
      return;
    }
    if (incoming.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, file: 'Ukuran file maks 10MB' }));
      return;
    }
    setErrors((prev) => ({ ...prev, file: '' }));
    setFile(incoming);

    // Preview lokal untuk gambar
    const isImage = incoming.type.startsWith('image/');
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(incoming);
    } else {
      setFilePreview(null);
    }

    // Upload ke server segera
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', incoming);

      const res = await fetch('/api/midtrans/upload-attachment', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': getCsrfToken(), 'Accept': 'application/json' },
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || 'Upload gagal');
      }

      const result = await res.json() as { path: string; url: string };
      setUploadedPath(result.path);

      // Jika file adalah gambar, gunakan URL server sebagai preview final
      if (isImage) setFilePreview(result.url);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload gagal';
      setErrors((prev) => ({ ...prev, file: msg }));
      setFile(null);
      setFilePreview(null);
      setUploadedPath(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0] ?? null;
    handleFile(dropped);
  };

  // ─── Submit: request Snap token → buka popup Midtrans ───────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const next: Record<string, string> = {};
    if (!judul.trim())     next.judul     = 'Judul wajib diisi';
    if (!deskripsi.trim()) next.deskripsi = 'Deskripsi wajib diisi';
    setErrors((prev) => ({ ...prev, ...next }));
    if (Object.values(next).some(Boolean)) return;

    if (uploading) {
      setErrors((prev) => ({ ...prev, submit: 'Tunggu hingga file selesai diupload.' }));
      return;
    }

    setSubmitting(true);
    setPaymentStatus('idle');

    try {
      // 1. Request Snap token ke backend
      const response = await fetch('/api/midtrans/create-transaction', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept':       'application/json',
          'X-XSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'include',
        body: JSON.stringify({
          duration:        duration,
          post_title:      judul,
          attachment_path: uploadedPath,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || 'Gagal membuat transaksi');
      }

      const data = await response.json() as { snap_token: string; order_id: string; amount: number };

      // 2. Buka Midtrans Snap popup
      if (!window.snap) {
        throw new Error('Midtrans Snap belum siap. Silakan refresh halaman.');
      }

      setSubmitting(false);

      window.snap.pay(data.snap_token, {
        onSuccess: async (_result) => {
          setPaymentStatus('success');

          // Verifikasi & update status ke backend (fallback untuk localhost)
          try {
            await fetch('/api/midtrans/check-and-mark-paid', {
              method:  'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept':       'application/json',
                'X-XSRF-TOKEN': getCsrfToken(),
              },
              credentials: 'include',
              body: JSON.stringify({ order_id: data.order_id }),
            });
          } catch (_err) {
            console.warn('check-and-mark-paid failed, webhook will handle it');
          }
        },
        onPending: (_result) => {
          setPaymentStatus('pending');
        },
        onError: (_result) => {
          setPaymentStatus('error');
        },
        onClose: () => {
          setSubmitting(false);
        },
      });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setErrors((prev) => ({ ...prev, submit: message }));
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <Head title="Premium Post" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Premium Post
          </h1>
          <p className="mt-2 text-gray-500 text-sm max-w-2xl">
            Promosikan kegiatan edukasi Anda ke jangkauan audiens yang lebih luas dengan
            layanan prioritas LucidPost.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Informasi Kegiatan */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-900">Informasi Kegiatan</h2>
              </div>

              <div className="space-y-5">
                {/* Judul */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    Judul Kegiatan
                  </label>
                  <input
                    type="text"
                    value={judul}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setJudul(e.target.value);
                      if (errors.judul) setErrors((p) => ({ ...p, judul: '' }));
                    }}
                    placeholder="Contoh: Webinar Strategi Belajar Efektif"
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition ${
                      errors.judul ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.judul && <p className="text-[11px] text-red-500">{errors.judul}</p>}
                </div>

                {/* Deskripsi */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    Deskripsi
                  </label>
                  <textarea
                    rows={5}
                    value={deskripsi}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                      setDeskripsi(e.target.value);
                      if (errors.deskripsi) setErrors((p) => ({ ...p, deskripsi: '' }));
                    }}
                    placeholder="Jelaskan detail kegiatan, tujuan, dan sasaran peserta..."
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition resize-none ${
                      errors.deskripsi ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.deskripsi && <p className="text-[11px] text-red-500">{errors.deskripsi}</p>}
                </div>

                {/* Lampiran */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    Lampiran Pendukung
                  </label>

                  {/* Preview gambar jika ada */}
                  {filePreview && (
                    <div className="relative w-full rounded-lg overflow-hidden border border-amber-200 bg-gray-50" style={{ height: '160px' }}>
                      <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setFile(null); setFilePreview(null); setUploadedPath(null); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {uploading && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <span className="text-xs text-amber-700 font-medium">Mengupload...</span>
                        </div>
                      )}
                    </div>
                  )}

                  <label
                    htmlFor="lampiran"
                    onDragOver={(e: DragEvent<HTMLLabelElement>) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center gap-1.5 min-h-[110px] rounded-lg border-2 border-dashed cursor-pointer transition-all py-6 px-4 text-center ${
                      dragActive
                        ? 'border-amber-400 bg-amber-50'
                        : file
                          ? 'border-amber-300 bg-amber-50/40'
                          : 'border-gray-300 bg-white hover:border-amber-300 hover:bg-amber-50/40'
                    }`}
                  >
                    {uploading ? (
                      <svg className="animate-spin w-7 h-7 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    )}
                    <p className="text-sm text-gray-600">
                      {uploading ? (
                        <span className="font-medium text-amber-600">Mengupload...</span>
                      ) : file ? (
                        <span className="font-medium text-amber-600">{file.name}</span>
                      ) : (
                        'Klik untuk unggah atau seret file'
                      )}
                    </p>
                    <p className="text-[11px] text-gray-400">PDF, PNG, atau JPG (Maks. 10MB)</p>
                    <input
                      ref={fileInputRef}
                      id="lampiran"
                      type="file"
                      accept=".pdf,image/png,image/jpeg"
                      className="hidden"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0] ?? null)}
                    />
                    {errors.file && <p className="text-[11px] text-red-500">{errors.file}</p>}
                  </label>
                </div>
              </div>
            </div>

            {/* Pilih Durasi Layanan */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-900">Pilih Durasi Layanan</h2>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {durationOptions.map((opt) => {
                  const active = duration === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDuration(opt.id)}
                      className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                        active
                          ? 'border-amber-400 bg-amber-50/60 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-amber-200'
                      }`}
                    >
                      {opt.popular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white bg-amber-500 rounded-full whitespace-nowrap">
                          PALING POPULER
                        </span>
                      )}
                      <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                        {opt.label}
                      </p>
                      <p className={`mt-2 text-base font-bold ${active ? 'text-amber-700' : 'text-gray-900'}`}>
                        {formatRupiah(opt.price)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column — Ringkasan Pembayaran */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
              <div className="h-1.5 bg-amber-400" />
              <div className="p-6 sm:p-7">
                <h2 className="text-base font-semibold text-gray-900 mb-5">Ringkasan Pembayaran</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Layanan Premium ({selectedDuration.label})</span>
                    <span className="text-gray-800">{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Pajak (PPN 11%)</span>
                    <span className="text-gray-800">{formatRupiah(tax)}</span>
                  </div>
                </div>

                <div className="my-5 border-t border-dashed border-gray-200" />

                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-semibold text-gray-900">Total Bayar</span>
                  <span className="text-lg font-bold text-amber-600">{formatRupiah(total)}</span>
                </div>

                <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase mb-3">
                  Metode Pembayaran
                </p>
                <div className="space-y-2.5 mb-5">
                  {paymentOptions.map((opt) => {
                    const active = payment === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                          active
                            ? 'border-amber-400 bg-amber-50/60'
                            : 'border-gray-200 bg-white hover:border-amber-200'
                        }`}
                      >
                        <span className={`flex items-center justify-center w-7 h-7 rounded-md ${
                          active ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={opt.iconPath} />
                          </svg>
                        </span>
                        <span className="flex-1 text-sm text-gray-700">{opt.label}</span>
                        <input
                          type="radio"
                          name="payment"
                          value={opt.id}
                          checked={active}
                          onChange={() => setPayment(opt.id)}
                          className="w-4 h-4 text-amber-500 border-gray-300 focus:ring-amber-400"
                        />
                      </label>
                    );
                  })}
                </div>

                {/* Status alerts */}
                {paymentStatus === 'success' && (
                  <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                    ✅ Pembayaran berhasil! Post Anda sedang diproses.
                  </div>
                )}
                {paymentStatus === 'pending' && (
                  <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-medium">
                    ⏳ Pembayaran pending. Selesaikan pembayaran Anda.
                  </div>
                )}
                {paymentStatus === 'error' && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                    ❌ Pembayaran gagal. Silakan coba lagi.
                  </div>
                )}
                {errors.submit && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {errors.submit}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || uploading || paymentStatus === 'success'}
                  className="w-full py-3 text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 disabled:bg-amber-300 disabled:cursor-not-allowed rounded-full shadow-sm transition-colors"
                >
                  {submitting
                    ? 'Memproses...'
                    : uploading
                      ? 'Menunggu upload...'
                      : paymentStatus === 'success'
                        ? 'Pembayaran Selesai ✓'
                        : 'Bayar Sekarang'}
                </button>

                <p className="text-[10px] text-gray-400 text-center tracking-wider uppercase mt-4 leading-relaxed">
                  Dengan mengeklik tombol di atas, Anda menyetujui ketentuan layanan
                  LucidPost dan kebijakan privasi kami.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
