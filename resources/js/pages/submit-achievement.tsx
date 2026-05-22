import { useState, useRef, ChangeEvent, FormEvent, DragEvent } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

const tahunAjaranOptions = ['2023/2024', '2024/2025', '2025/2026', '2026/2027'];
const kategoriOptions = ['Kompetisi Ilmiah', 'Kompetisi Olahraga', 'Kompetisi Seni', 'Pengabdian Masyarakat', 'Konferensi', 'Lainnya'];
const tingkatOptions = ['Internal Kampus', 'Lokal', 'Regional', 'Nasional', 'Internasional'];
const keikutsertaanOptions = ['Individu', 'Tim/Kelompok'];

interface FormState {
  nim: string;
  namaLengkap: string;
  tahunAjaran: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  kategori: string;
  jenis: string;
  tingkat: string;
  keikutsertaan: string;
  deskripsi: string;
  linkSertifikat: string;
  setuju: boolean;
}

const initialForm: FormState = {
  nim: '',
  namaLengkap: '',
  tahunAjaran: '2023/2024',
  tanggalMulai: '',
  tanggalSelesai: '',
  kategori: 'Kompetisi Ilmiah',
  jenis: '',
  tingkat: 'Internasional',
  keikutsertaan: 'Individu',
  deskripsi: '',
  linkSertifikat: '',
  setuju: false,
};

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mt-2">
      <span className="text-[11px] font-semibold tracking-wider text-amber-600 uppercase whitespace-nowrap">
        {children}
      </span>
      <span className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

export default function SubmitAchievementPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const target = e.target;
    const name = target.name as keyof FormState;
    const value =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value;
    setForm((prev) => ({ ...prev, [name]: value as FormState[typeof name] }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFile = (incoming: File | null) => {
    if (!incoming) {
      setFile(null);
      setPreview(null);
      return;
    }
    if (incoming.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, file: 'Ukuran file maks 2MB' }));
      return;
    }
    setErrors((prev) => ({ ...prev, file: '' }));
    setFile(incoming);
    if (incoming.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(incoming);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0] ?? null;
    handleFile(dropped);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.nim.trim()) next.nim = 'NIM wajib diisi';
    if (!form.namaLengkap.trim()) next.namaLengkap = 'Nama wajib diisi';
    if (!form.tanggalMulai) next.tanggalMulai = 'Tanggal mulai wajib diisi';
    if (!form.tanggalSelesai) next.tanggalSelesai = 'Tanggal selesai wajib diisi';
    if (!form.jenis.trim()) next.jenis = 'Jenis kegiatan wajib diisi';
    if (!form.deskripsi.trim()) next.deskripsi = 'Deskripsi wajib diisi';
    if (!form.setuju) next.setuju = 'Anda harus menyetujui pernyataan';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    
    try {
      // Create FormData for multipart/form-data (file upload)
      const formData = new FormData();
      
      // Add all form fields
      formData.append('nim', form.nim);
      formData.append('nama_lengkap', form.namaLengkap);
      formData.append('tahun_ajaran', form.tahunAjaran);
      formData.append('tanggal_mulai', form.tanggalMulai);
      formData.append('tanggal_selesai', form.tanggalSelesai);
      formData.append('title', form.jenis); // Jenis as title
      formData.append('description', form.deskripsi);
      formData.append('category', form.kategori);
      formData.append('jenis', form.jenis);
      formData.append('tingkat', form.tingkat);
      formData.append('keikutsertaan', form.keikutsertaan);
      formData.append('link_sertifikat', form.linkSertifikat);
      
      // Add file if present
      if (file) {
        formData.append('bukti', file);
      }
      
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') || '',
        },
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        let errorMessage = 'Gagal mengirim prestasi';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            const errorData = await response.json();
            if (errorData.errors) {
              const errorList = Object.values(errorData.errors).flat().join(', ');
              errorMessage = errorList || errorData.message || errorMessage;
            } else {
              errorMessage = errorData.message || errorMessage;
            }
          }
        } catch (parseError) {
          errorMessage = `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setShowSuccessModal(true);
      setForm(initialForm);
      setFile(null);
      setPreview(null);
      setErrors({});
    } catch (err: any) {
      setErrors({ submit: err.message || 'Terjadi kesalahan saat mengirim prestasi' });
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    const draft = { ...form, file };
    localStorage.setItem('achievementDraft', JSON.stringify({
      ...form,
      fileName: file?.name,
    }));
    alert('Draft tersimpan secara lokal. Anda bisa melanjutkannya nanti.');
  };

  return (
    <AppLayout>
      <Head title="Submit Achievement" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/achievements"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to My Achievements
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Submit Achievement
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Bagikan pencapaian dan prestasi akademik Anda.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6"
        >
          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <p className="font-medium">Error:</p>
              <p>{errors.submit}</p>
            </div>
          )}
          {/* Identitas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="NIM">
              <input
                type="text"
                name="nim"
                value={form.nim}
                onChange={handleChange}
                placeholder="contoh: 21004567"
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition ${
                  errors.nim ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.nim && <p className="text-[11px] text-red-500">{errors.nim}</p>}
            </Field>
            <Field label="Nama Lengkap">
              <input
                type="text"
                name="namaLengkap"
                value={form.namaLengkap}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition ${
                  errors.namaLengkap ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.namaLengkap && (
                <p className="text-[11px] text-red-500">{errors.namaLengkap}</p>
              )}
            </Field>
          </div>

          {/* Jadwal Kegiatan */}
          <SectionLabel>Jadwal Kegiatan</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="Tahun Ajaran">
              <select
                name="tahunAjaran"
                value={form.tahunAjaran}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition appearance-none bg-no-repeat bg-right pr-9"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E\")",
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1rem',
                }}
              >
                {tahunAjaranOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tanggal Mulai">
              <input
                type="date"
                name="tanggalMulai"
                value={form.tanggalMulai}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition ${
                  errors.tanggalMulai ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.tanggalMulai && (
                <p className="text-[11px] text-red-500">{errors.tanggalMulai}</p>
              )}
            </Field>
            <Field label="Tanggal Selesai">
              <input
                type="date"
                name="tanggalSelesai"
                value={form.tanggalSelesai}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition ${
                  errors.tanggalSelesai ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.tanggalSelesai && (
                <p className="text-[11px] text-red-500">{errors.tanggalSelesai}</p>
              )}
            </Field>
          </div>

          {/* Informasi Kegiatan */}
          <SectionLabel>Informasi Kegiatan</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Field label="Kategori">
              <select
                name="kategori"
                value={form.kategori}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition appearance-none pr-9"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E\")",
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1rem',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {kategoriOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Jenis">
              <input
                type="text"
                name="jenis"
                value={form.jenis}
                onChange={handleChange}
                placeholder="contoh: Hackathon"
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition ${
                  errors.jenis ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.jenis && <p className="text-[11px] text-red-500">{errors.jenis}</p>}
            </Field>
            <Field label="Tingkat">
              <select
                name="tingkat"
                value={form.tingkat}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition appearance-none pr-9"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E\")",
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1rem',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {tingkatOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Keikutsertaan">
              <select
                name="keikutsertaan"
                value={form.keikutsertaan}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition appearance-none pr-9"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E\")",
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1rem',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {keikutsertaanOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Deskripsi & Bukti */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-5">
              <Field label="Deskripsi Prestasi">
                <textarea
                  name="deskripsi"
                  value={form.deskripsi}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Jelaskan secara singkat peran Anda dan hasil dari prestasi tersebut..."
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition resize-none ${
                    errors.deskripsi ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.deskripsi && (
                  <p className="text-[11px] text-red-500">{errors.deskripsi}</p>
                )}
              </Field>
              <Field label="Link Sertifikat (Opsional)">
                <input
                  type="url"
                  name="linkSertifikat"
                  value={form.linkSertifikat}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                />
              </Field>
            </div>

            {/* File Upload */}
            <Field label="Bukti Prestasi">
              <label
                htmlFor="bukti"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center gap-2 h-full min-h-[180px] rounded-lg border-2 border-dashed cursor-pointer transition-all p-6 text-center ${
                  dragActive
                    ? 'border-amber-400 bg-amber-50'
                    : file
                      ? 'border-amber-300 bg-amber-50/40'
                      : 'border-gray-300 bg-gray-50 hover:border-amber-300 hover:bg-amber-50/40'
                }`}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Pratinjau bukti prestasi"
                    className="max-h-32 w-auto rounded-lg object-contain"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-9 h-9 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                )}
                <p className="text-sm text-gray-600">
                  {file ? (
                    <span className="font-medium text-amber-600">{file.name}</span>
                  ) : (
                    'Klik untuk unggah PDF atau Gambar'
                  )}
                </p>
                <p className="text-[11px] text-amber-600 font-medium">
                  Ukuran maks 2MB
                </p>
                <input
                  ref={fileInputRef}
                  id="bukti"
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
                {errors.file && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.file}</p>
                )}
              </label>
            </Field>
          </div>

          {/* Pernyataan + Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-gray-100">
            <label className="flex items-start gap-3 text-xs text-gray-500 max-w-xl cursor-pointer">
              <input
                type="checkbox"
                name="setuju"
                checked={form.setuju}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
              />
              <span>
                Dengan ini saya menyatakan bahwa data yang diunggah adalah akurat. Saya
                siap menerima sanksi atas segala informasi palsu yang diberikan.
                {errors.setuju && (
                  <span className="block text-red-500 mt-0.5">{errors.setuju}</span>
                )}
              </span>
            </label>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Simpan Draf
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 disabled:bg-amber-300 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
              >
                {submitting ? 'Mengirim...' : 'Kirim Prestasi'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                Prestasi Berhasil Dikirim
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Data prestasi berhasil dikirim dan saat ini sedang menunggu proses
                verifikasi admin.
              </p>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
