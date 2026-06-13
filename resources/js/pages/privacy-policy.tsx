import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';

export default function PrivacyPolicy() {
  const { auth } = usePage<SharedData>().props;
  const user = auth?.user;
  const lastUpdated = '13 Juni 2026';

  const sections = [
    {
      title: '1. Informasi yang Kami Kumpulkan',
      content: [
        'Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami saat mendaftar akun, termasuk:',
      ],
      list: [
        'Nama lengkap dan alamat email',
        'Nomor Induk Mahasiswa (NIM)',
        'Fakultas dan program studi',
        'Informasi profil seperti foto dan bio',
        'Data aktivitas dan prestasi akademik yang Anda unggah',
      ],
    },
    {
      title: '2. Penggunaan Informasi',
      content: [
        'Informasi yang kami kumpulkan digunakan untuk:',
      ],
      list: [
        'Menyediakan, memelihara, dan meningkatkan layanan platform',
        'Mengelola akun dan memberikan dukungan pengguna',
        'Menampilkan profil dan pencapaian Anda di platform',
        'Mengirimkan notifikasi terkait aktivitas akun',
        'Menganalisis penggunaan platform untuk peningkatan layanan',
      ],
    },
    {
      title: '3. Perlindungan Data',
      content: [
        'Kami berkomitmen melindungi data pribadi Anda dengan menerapkan langkah-langkah keamanan yang sesuai, termasuk enkripsi data, kontrol akses yang ketat, dan audit keamanan berkala.',
        'Kami tidak akan menjual, memperdagangkan, atau menyewakan informasi pribadi Anda kepada pihak ketiga tanpa persetujuan Anda.',
      ],
    },
    {
      title: '4. Berbagi Informasi',
      content: [
        'Kami dapat membagikan informasi Anda dalam situasi berikut:',
      ],
      list: [
        'Dengan persetujuan eksplisit dari Anda',
        'Untuk memenuhi kewajiban hukum atau peraturan yang berlaku',
        'Dengan pihak institusi pendidikan terkait untuk verifikasi data akademik',
        'Dengan penyedia layanan pihak ketiga yang membantu operasional platform (dengan perjanjian kerahasiaan)',
      ],
    },
    {
      title: '5. Cookie dan Teknologi Pelacakan',
      content: [
        'Platform kami menggunakan cookie dan teknologi serupa untuk meningkatkan pengalaman pengguna, menganalisis lalu lintas, dan memahami pola penggunaan. Anda dapat mengatur preferensi cookie melalui pengaturan browser Anda.',
      ],
    },
    {
      title: '6. Hak Pengguna',
      content: [
        'Sebagai pengguna, Anda memiliki hak untuk:',
      ],
      list: [
        'Mengakses dan memperbarui informasi pribadi Anda',
        'Meminta penghapusan akun dan data terkait',
        'Menarik persetujuan atas pengumpulan data tertentu',
        'Mendapatkan salinan data pribadi yang kami simpan',
      ],
    },
    {
      title: '7. Perubahan Kebijakan',
      content: [
        'Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi di platform. Penggunaan berkelanjutan atas layanan kami setelah perubahan merupakan bentuk persetujuan Anda terhadap kebijakan yang diperbarui.',
      ],
    },
    {
      title: '8. Hubungi Kami',
      content: [
        'Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini, silakan hubungi kami melalui:',
      ],
      list: [
        'Email: privacy@prodigi-dtc.ac.id',
        'Halaman Contact Us di platform',
      ],
    },
  ];

  return (
    <AppLayout>
      <Head title="Privacy Policy" />
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12" style={{ maxWidth: '900px', width: '100%' }}>
        {/* Header */}
        <div className="mb-8">
          <Link
            href={user ? route('dashboard') : route('home')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-amber-600 transition-colors mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {user ? 'Kembali ke Dashboard' : 'Kembali ke Beranda'}
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Kebijakan Privasi</h1>
              <p className="text-sm text-gray-400 mt-0.5">Terakhir diperbarui: {lastUpdated}</p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
            <p className="text-sm text-blue-700 leading-relaxed">
              Digital Talent Centre (PRODIGI) berkomitmen untuk melindungi privasi pengguna kami. 
              Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda 
              saat menggunakan platform kami.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-bold text-gray-900 mb-3">{section.title}</h2>
              {section.content.map((paragraph, i) => (
                <p key={i} className="text-sm text-gray-600 leading-relaxed mb-3">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="space-y-2 ml-1">
                  {section.list.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
