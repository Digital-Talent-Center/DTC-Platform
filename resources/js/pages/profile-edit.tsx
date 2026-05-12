import { useState, useEffect, FormEvent } from 'react';
import AppLayout from "@/layouts/app-layout";
import { Head, Link, usePage } from "@inertiajs/react";
import { api, type ProfileExtension } from '@/services/api';
import { type SharedData } from '@/types';

export default function ProfileEditPage() {
  const { auth } = usePage<SharedData>().props;
  const [profile, setProfile] = useState<ProfileExtension | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nim: '', faculty: '', major: '', phone: '', about: '' });
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });

  const getInitials = (name?: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AA';

  useEffect(() => {
    api.profile.get()
      .then(res => {
        setProfile(res.data);
        setForm({
          nim: res.data?.nim ?? '',
          faculty: res.data?.faculty ?? '',
          major: res.data?.major ?? '',
          phone: res.data?.phone ?? '',
          about: res.data?.about ?? '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await api.profile.update(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      setError('');
      const res = await api.profile.uploadAvatar(file);
      setProfile(prev => prev ? { ...prev, avatarUrl: res.data.avatarUrl } : null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setSaving(false);
      // Reset input
      e.target.value = '';
    }
  };

  const EyeIcon = ({ open }: { open: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </>
      )}
    </svg>
  );

  return (
    <AppLayout>
      <Head title="Edit Profile" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">
        <div className="mb-6">
          <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Profile
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8 flex items-center gap-5 border-b border-gray-100">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0 overflow-hidden">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(auth.user?.name)
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity rounded-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-[10px] font-bold">Ubah</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{auth.user?.name || 'User'}</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{auth.user?.email}</p>
                  <span className="inline-block mt-1.5 px-3 py-0.5 text-[10px] font-bold tracking-wider rounded-full bg-amber-100 text-amber-700 capitalize">
                    {profile?.role || 'Student'}
                  </span>
                </div>
              </div>

              {success && (
                <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">✓ Profil berhasil diperbarui!</div>
              )}
              {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                {loading ? (
                  <div className="animate-pulse space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { name: 'nim', label: 'NIM', placeholder: 'contoh: 21004567' },
                      { name: 'faculty', label: 'Fakultas', placeholder: 'Faculty of Computer Science' },
                      { name: 'major', label: 'Program Studi', placeholder: 'S1 Informatika' },
                      { name: 'phone', label: 'WhatsApp / Phone', placeholder: '+62812345678' },
                    ].map(field => (
                      <div key={field.name}>
                        <label className="block text-[10px] font-semibold tracking-wider text-gray-400 mb-2 uppercase">{field.label}</label>
                        <input
                          type="text" name={field.name} value={(form as any)[field.name]}
                          onChange={handleChange} placeholder={field.placeholder}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold tracking-wider text-gray-400 mb-2 uppercase">About / Bio</label>
                      <textarea
                        name="about" value={form.about} onChange={handleChange} rows={3}
                        placeholder="Ceritakan sedikit tentang dirimu..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition resize-none"
                      />
                    </div>
                  </div>
                )}
                <div className="mt-6 flex items-center gap-3">
                  <button type="submit" disabled={saving || loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full shadow-sm transition-all">
                    {saving && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  <Link href="/profile" className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors">Batal</Link>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Change Password */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 h-fit">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Ganti Password</h2>
              <p className="text-sm text-gray-400 mb-6">Perbarui kata sandi akun kamu.</p>
              <div className="space-y-4">
                {([
                  { key: 'old' as const, label: 'PASSWORD LAMA', placeholder: 'Masukkan password saat ini' },
                  { key: 'new' as const, label: 'PASSWORD BARU', placeholder: 'Masukkan password baru' },
                  { key: 'confirm' as const, label: 'KONFIRMASI PASSWORD', placeholder: 'Konfirmasi password baru' },
                ]).map(field => (
                  <div key={field.key}>
                    <label className="block text-[10px] font-semibold tracking-wider text-gray-400 mb-2">{field.label}</label>
                    <div className="relative">
                      <input
                        type={showPassword[field.key] ? 'text' : 'password'}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all pr-11"
                      />
                      <button type="button" onClick={() => setShowPassword(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        <EyeIcon open={showPassword[field.key]} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button type="button" className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
                  Simpan Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
