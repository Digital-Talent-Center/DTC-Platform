import { useState, useRef, useCallback } from 'react';
import type { ChangeEvent, FormEvent, DragEvent } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

// ─── Types ───────────────────────────────────────────────────────────────────
type Duration      = '7-hari' | '1-bulan' | '3-bulan';
type PaymentMethod = 'virtual-account' | 'e-wallet' | 'kartu-kredit';
type PaymentStatus = 'idle' | 'success' | 'pending' | 'error';

interface DurationOption {
  id: Duration;
  label: string;
  price: number;
  popular?: boolean;
}

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  iconPath: string;
}

// ─── Midtrans Snap global (diload dari Blade template via CDN) ────────────────
interface SnapCallbacks {
  onSuccess: (result: Record<string, unknown>) => void;
  onPending: (result: Record<string, unknown>) => void;
  onError:   (result: Record<string, unknown>) => void;
  onClose:   () => void;
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string, callbacks: SnapCallbacks) => void;
    };
  }
}

// ─── Module-level constants (di luar JSX, tidak ada masalah Vite HMR) ─────────
const ALLOWED_TYPES: string[] = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_FILE_BYTES           = 10 * 1024 * 1024; // 10MB
const TAX_RATE                 = 0.11;

const DURATION_OPTIONS: DurationOption[] = [
  { id: '7-hari',  label: '7 Hari',   price: 49000 },
  { id: '1-bulan', label: '1 Bulan',  price: 149000, popular: true },
  { id: '3-bulan', label: '3 Bulan',  price: 399000 },
];

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'virtual-account',
    label: 'Virtual Account',
    iconPath: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z',
  },
  {
    id: 'e-wallet',
    label: 'E-Wallet (OVO/Gopay)',
    iconPath: 'M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3',
  },
  {
    id: 'kartu-kredit',
    label: 'Kartu Kredit',
    iconPath: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
  },
];

function formatRupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function getCsrfToken(): string {
  const xsrf = document.cookie
    .split(';')
    .map(function(c) { return c.trim(); })
    .find(function(c) { return c.startsWith('XSRF-TOKEN='); });
  return xsrf ? decodeURIComponent(xsrf.slice(11)) : '';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PremiumPostPage() {
  const [judul,         setJudul]         = useState('');
  const [deskripsi,     setDeskripsi]     = useState('');
  const [file,          setFile]          = useState<File | null>(null);
  const [filePreview,   setFilePreview]   = useState<string | null>(null);
  const [uploadedPath,  setUploadedPath]  = useState<string | null>(null);
  const [uploading,     setUploading]     = useState(false);
  const [dragActive,    setDragActive]    = useState(false);
  const [duration,      setDuration]      = useState<Duration>('1-bulan');
  const [payment,       setPayment]       = useState<PaymentMethod>('e-wallet');
  const [formErrors,    setFormErrors]    = useState<Record<string, string>>({});
  const [submitting,    setSubmitting]    = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Computed values ──────────────────────────────────────────────────────
  const selectedOption = DURATION_OPTIONS.find(function(d) { return d.id === duration; });
  const selectedDuration = selectedOption !== undefined ? selectedOption : DURATION_OPTIONS[1];
  const subtotal = selectedDuration.price;
  const tax      = Math.round(subtotal * TAX_RATE);
  const total    = subtotal + tax;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const resetFile = useCallback(function() {
    setFile(null);
    setFilePreview(null);
    setUploadedPath(null);
    if (fileInputRef.current !== null) {
      fileInputRef.current.value = '';
    }
  }, []);

  // ─── File upload ──────────────────────────────────────────────────────────
  const handleFile = useCallback(async function(incoming: File | null) {
    if (incoming === null) {
      resetFile();
      return;
    }

    if (!ALLOWED_TYPES.includes(incoming.type)) {
      setFormErrors(function(prev) {
        return Object.assign({}, prev, { file: 'Format file tidak valid. Gunakan PDF, PNG, atau JPG/JPEG.' });
      });
      resetFile();
      return;
    }

    if (incoming.size > MAX_FILE_BYTES) {
      setFormErrors(function(prev) {
        return Object.assign({}, prev, { file: 'Ukuran file melebihi batas maksimal 10MB.' });
      });
      resetFile();
      return;
    }

    setFormErrors(function(prev) {
      return Object.assign({}, prev, { file: '' });
    });
    setFile(incoming);

    const isImage = incoming.type.indexOf('image/') === 0;
    if (isImage) {
      const reader = new FileReader();
      reader.onload = function(e) {
        if (e.target) {
          setFilePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(incoming);
    } else {
      setFilePreview(null);
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', incoming);

      const res = await fetch('/api/midtrans/upload-attachment', {
        method: 'POST',
        headers: {
          'X-XSRF-TOKEN': getCsrfToken(),
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        let errMsg = 'Upload gagal. Coba lagi.';
        try {
          const errData = await res.json() as { message?: string };
          if (errData.message) {
            errMsg = errData.message;
          }
        } catch (_e) {
          // ignore json parse error
        }
        throw new Error(errMsg);
      }

      const result = await res.json() as { path: string; url: string };
      setUploadedPath(result.path);
      if (isImage) {
        setFilePreview(result.url);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload gagal. Silakan coba lagi.';
      setFormErrors(function(prev) {
        return Object.assign({}, prev, { file: msg });
      });
      resetFile();
    } finally {
      setUploading(false);
    }
  }, [resetFile]);

  const handleDrop = useCallback(function(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    const dropped = files && files.length > 0 ? files[0] : null;
    handleFile(dropped);
  }, [handleFile]);

  // ─── Form submit → Midtrans Snap ─────────────────────────────────────────
  const handleSubmit = async function(e: FormEvent) {
    e.preventDefault();

    const next: Record<string, string> = {};
    if (!judul.trim())     { next['judul']     = 'Judul wajib diisi'; }
    if (!deskripsi.trim()) { next['deskripsi'] = 'Deskripsi wajib diisi'; }

    if (Object.keys(next).length > 0) {
      setFormErrors(function(prev) {
        return Object.assign({}, prev, next);
      });
      return;
    }

    if (uploading) {
      setFormErrors(function(prev) {
        return Object.assign({}, prev, { submit: 'Tunggu hingga file selesai diupload.' });
      });
      return;
    }

    setSubmitting(true);
    setPaymentStatus('idle');
    setFormErrors({});

    try {
      const response = await fetch('/api/midtrans/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'include',
        body: JSON.stringify({
          duration:         duration,
          post_title:       judul,
          post_description: deskripsi,
          attachment_path:  uploadedPath,
        }),
      });

      if (!response.ok) {
        let errMsg = 'Gagal membuat transaksi. Coba lagi.';
        try {
          const errData = await response.json() as { message?: string };
          if (errData.message) {
            errMsg = errData.message;
          }
        } catch (_e) {
          // ignore
        }
        throw new Error(errMsg);
      }

      const data = await response.json() as { snap_token: string; order_id: string; amount: number };

      // Midtrans Snap sudah diload via Blade template (window.snap)
      if (!window.snap) {
        throw new Error('Midtrans Snap belum siap. Refresh halaman dan coba lagi.');
      }

      setSubmitting(false);

      const orderId = data.order_id;

      window.snap.pay(data.snap_token, {
        onSuccess: async function(_result) {
          setPaymentStatus('success');
          try {
            await fetch('/api/midtrans/check-and-mark-paid', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-XSRF-TOKEN': getCsrfToken(),
              },
              credentials: 'include',
              body: JSON.stringify({ order_id: orderId }),
            });
          } catch (_e) {
            // webhook akan menanganinya
          }
          setTimeout(function() {
            window.location.href = '/dashboard';
          }, 2500);
        },
        onPending: function(_result) {
          setPaymentStatus('pending');
        },
        onError: function(_result) {
          setPaymentStatus('error');
          setSubmitting(false);
        },
        onClose: function() {
          setSubmitting(false);
        },
      });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      setFormErrors(function(prev) {
        return Object.assign({}, prev, { submit: message });
      });
      setSubmitting(false);
    }
  };

  // ─── Upload area className (diekstrak, tidak ada nested ternary dalam JSX) ─
  let uploadAreaClass = [
    'flex flex-col items-center justify-center gap-1.5',
    'min-h-[110px] rounded-lg border-2 border-dashed',
    'cursor-pointer transition-all py-6 px-4 text-center',
  ].join(' ');

  if (dragActive) {
    uploadAreaClass += ' border-amber-400 bg-amber-50';
  } else if (file !== null) {
    uploadAreaClass += ' border-amber-300 bg-amber-50/40';
  } else {
    uploadAreaClass += ' border-gray-300 bg-white hover:border-amber-300 hover:bg-amber-50/40';
  }

  // ─── Render ───────────────────────────────────────────────────────────────
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

          {/* ── Left Column ── */}
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
                    id="input-judul"
                    type="text"
                    value={judul}
                    onChange={function(e: ChangeEvent<HTMLInputElement>) {
                      setJudul(e.target.value);
                      if (formErrors['judul']) {
                        setFormErrors(function(p) { return Object.assign({}, p, { judul: '' }); });
                      }
                    }}
                    placeholder="Contoh: Webinar Strategi Belajar Efektif"
                    className={
                      'w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-700 ' +
                      'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 ' +
                      'focus:border-transparent transition ' +
                      (formErrors['judul'] ? 'border-red-300' : 'border-gray-200')
                    }
                  />
                  {formErrors['judul'] && (
                    <p className="text-[11px] text-red-500">{formErrors['judul']}</p>
                  )}
                </div>

                {/* Deskripsi */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    Deskripsi
                  </label>
                  <textarea
                    id="input-deskripsi"
                    rows={5}
                    value={deskripsi}
                    onChange={function(e: ChangeEvent<HTMLTextAreaElement>) {
                      setDeskripsi(e.target.value);
                      if (formErrors['deskripsi']) {
                        setFormErrors(function(p) { return Object.assign({}, p, { deskripsi: '' }); });
                      }
                    }}
                    placeholder="Jelaskan detail kegiatan, tujuan, dan sasaran peserta..."
                    className={
                      'w-full px-4 py-3 bg-gray-50 border rounded-lg text-sm text-gray-700 ' +
                      'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 ' +
                      'focus:border-transparent transition resize-none ' +
                      (formErrors['deskripsi'] ? 'border-red-300' : 'border-gray-200')
                    }
                  />
                  {formErrors['deskripsi'] && (
                    <p className="text-[11px] text-red-500">{formErrors['deskripsi']}</p>
                  )}
                </div>

                {/* Lampiran */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    Lampiran Pendukung
                  </label>

                  {/* Preview gambar */}
                  {filePreview !== null && (
                    <div className="relative w-full rounded-lg overflow-hidden border border-amber-200 bg-gray-50" style={{ height: '160px' }}>
                      <img src={filePreview} alt="Preview lampiran" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={resetFile}
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

                  {/* Nama file PDF */}
                  {file !== null && filePreview === null && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span className="text-xs text-amber-700 font-medium truncate flex-1">{file.name}</span>
                      <button type="button" onClick={resetFile} className="text-amber-500 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Drop zone */}
                  <label
                    htmlFor="lampiran"
                    onDragOver={function(e: DragEvent<HTMLLabelElement>) { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={function() { setDragActive(false); }}
                    onDrop={handleDrop}
                    className={uploadAreaClass}
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
                      {uploading
                        ? 'Mengupload...'
                        : file !== null
                          ? 'Klik untuk ganti file'
                          : 'Klik untuk unggah atau seret file'}
                    </p>
                    <p className="text-[11px] text-gray-400">PDF, PNG, atau JPG/JPEG (Maks. 10MB)</p>

                    <input
                      ref={fileInputRef}
                      id="lampiran"
                      type="file"
                      accept=".pdf,image/png,image/jpeg"
                      className="hidden"
                      onChange={function(e: ChangeEvent<HTMLInputElement>) {
                        const files = e.target.files;
                        handleFile(files && files.length > 0 ? files[0] : null);
                      }}
                    />
                  </label>

                  {formErrors['file'] && (
                    <p className="text-[11px] text-red-500 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      {formErrors['file']}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pilih Durasi */}
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
                {DURATION_OPTIONS.map(function(opt) {
                  const active = duration === opt.id;
                  const btnBase = 'relative rounded-xl border-2 p-4 text-left transition-all ';
                  const btnState = active
                    ? 'border-amber-400 bg-amber-50/60 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-amber-200';
                  const priceColor = active ? 'text-amber-700' : 'text-gray-900';

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={function() { setDuration(opt.id); }}
                      className={btnBase + btnState}
                    >
                      {opt.popular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white bg-amber-500 rounded-full whitespace-nowrap">
                          PALING POPULER
                        </span>
                      )}
                      <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                        {opt.label}
                      </p>
                      <p className={'mt-2 text-base font-bold ' + priceColor}>
                        {formatRupiah(opt.price)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right Column — Ringkasan Pembayaran ── */}
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
                  {PAYMENT_OPTIONS.map(function(opt) {
                    const active = payment === opt.id;
                    const labelBase = 'flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ';
                    const labelState = active
                      ? 'border-amber-400 bg-amber-50/60'
                      : 'border-gray-200 bg-white hover:border-amber-200';
                    const iconBase = 'flex items-center justify-center w-7 h-7 rounded-md ';
                    const iconState = active ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500';

                    return (
                      <label key={opt.id} className={labelBase + labelState}>
                        <span className={iconBase + iconState}>
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
                          onChange={function() { setPayment(opt.id); }}
                          className="w-4 h-4 text-amber-500 border-gray-300 focus:ring-amber-400"
                        />
                      </label>
                    );
                  })}
                </div>

                {/* Status alerts */}
                {paymentStatus === 'success' && (
                  <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                    Pembayaran berhasil! Mengarahkan ke dashboard...
                  </div>
                )}
                {paymentStatus === 'pending' && (
                  <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-medium">
                    Pembayaran pending. Selesaikan pembayaran Anda.
                  </div>
                )}
                {paymentStatus === 'error' && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                    Pembayaran gagal. Silakan coba lagi.
                  </div>
                )}
                {formErrors['submit'] && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {formErrors['submit']}
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
                        ? 'Pembayaran Selesai'
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
