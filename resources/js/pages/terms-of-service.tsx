import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';

export default function TermsOfService() {
  const { auth } = usePage<SharedData>().props;
  const user = auth?.user;
  const lastUpdated = '13 Juni 2026';

  const sections = [
    {
      title: '1. Penerimaan Ketentuan',
      content: [
        'Dengan mengakses dan menggunakan platform Digital Talent Centre (PRODIGI), Anda menyetujui dan terikat oleh ketentuan layanan ini. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak menggunakan platform kami.',
        'Kami berhak untuk memperbarui ketentuan ini kapan saja. Perubahan akan berlaku segera setelah dipublikasikan di platform.',
      ],
    },
    {
      title: '2. Pendaftaran Akun',
      content: [
        'Untuk menggunakan fitur-fitur platform, Anda harus membuat akun dengan memberikan informasi yang akurat dan lengkap. Anda bertanggung jawab untuk:',
      ],
      list: [
        'Menjaga kerahasiaan informasi akun dan kata sandi Anda',
        'Semua aktivitas yang terjadi di bawah akun Anda',
        'Memberitahu kami segera jika terjadi penggunaan tidak sah atas akun Anda',
        'Memastikan informasi profil tetap akurat dan terbaru',
      ],
    },
    {
      title: '3. Penggunaan Layanan',
      content: [
        'Platform ini ditujukan untuk tujuan pendidikan dan pengembangan talenta digital. Anda setuju untuk menggunakan platform dengan cara yang bertanggung jawab dan tidak:',
      ],
      list: [
        'Melanggar hukum atau peraturan yang berlaku',
        'Mengunggah konten yang menyesatkan, memfitnah, atau melanggar hak cipta',
        'Menggunakan platform untuk spam atau aktivitas komersial yang tidak sah',
        'Mencoba mengakses sistem atau data tanpa otorisasi',
        'Mengganggu atau merusak operasi platform',
        'Membuat akun palsu atau menyamar sebagai orang lain',
      ],
    },
    {
      title: '4. Konten Pengguna',
      content: [
        'Anda mempertahankan kepemilikan atas konten yang Anda unggah ke platform. Namun, dengan mengunggah konten, Anda memberikan kami lisensi non-eksklusif untuk menampilkan, menyimpan, dan mendistribusikan konten tersebut di dalam platform.',
        'Kami berhak untuk menghapus konten yang melanggar ketentuan ini atau yang kami anggap tidak pantas, tanpa pemberitahuan sebelumnya.',
      ],
    },
    {
      title: '5. Fitur Premium',
      content: [
        'Beberapa fitur platform mungkin memerlukan pembayaran. Ketentuan berikut berlaku untuk fitur premium:',
      ],
      list: [
        'Semua pembayaran bersifat final dan tidak dapat dikembalikan kecuali ditentukan lain',
        'Harga dapat berubah dengan pemberitahuan sebelumnya',
        'Akses ke fitur premium dapat dibatasi atau dicabut jika terjadi pelanggaran ketentuan',
        'Kami berhak mengubah atau menghentikan fitur premium kapan saja',
      ],
    },
    {
      title: '6. Prestasi dan Pencapaian',
      content: [
        'Platform menyediakan fitur untuk mendokumentasikan dan menampilkan prestasi akademik. Anda bertanggung jawab atas keakuratan informasi prestasi yang Anda unggah.',
        'Kami berhak memverifikasi dan menghapus klaim prestasi yang terbukti tidak akurat atau menyesatkan.',
      ],
    },
    {
      title: '7. Hak Kekayaan Intelektual',
      content: [
        'Seluruh konten platform, termasuk namun tidak terbatas pada logo, desain, teks, grafik, dan perangkat lunak, merupakan milik PRODIGI dan dilindungi oleh hukum hak cipta.',
        'Anda tidak diperbolehkan menyalin, memodifikasi, mendistribusikan, atau membuat karya turunan dari konten platform tanpa izin tertulis dari kami.',
      ],
    },
    {
      title: '8. Pembatasan Tanggung Jawab',
      content: [
        'Platform disediakan "sebagaimana adanya" tanpa jaminan apa pun. Kami tidak bertanggung jawab atas:',
      ],
      list: [
        'Kerugian langsung atau tidak langsung yang timbul dari penggunaan platform',
        'Gangguan layanan atau kehilangan data',
        'Konten yang diunggah oleh pengguna lain',
        'Tautan ke situs web pihak ketiga',
      ],
    },
    {
      title: '9. Penangguhan dan Penghentian',
      content: [
        'Kami berhak menangguhkan atau menghentikan akun Anda jika Anda melanggar ketentuan layanan ini. Anda juga dapat menghapus akun Anda kapan saja melalui pengaturan profil.',
      ],
    },
    {
      title: '10. Hukum yang Berlaku',
      content: [
        'Ketentuan layanan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Setiap sengketa yang timbul dari penggunaan platform akan diselesaikan melalui musyawarah terlebih dahulu sebelum menggunakan jalur hukum.',
      ],
    },
  ];

  return (
    <AppLayout>
      <Head title="Terms of Service" />
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Ketentuan Layanan</h1>
              <p className="text-sm text-gray-400 mt-0.5">Terakhir diperbarui: {lastUpdated}</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4">
            <p className="text-sm text-amber-700 leading-relaxed">
              Silakan baca ketentuan layanan berikut dengan seksama sebelum menggunakan platform Digital Talent Centre (PRODIGI). 
              Ketentuan ini mengatur hak dan kewajiban Anda sebagai pengguna platform.
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
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
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
