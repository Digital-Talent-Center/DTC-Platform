import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';

interface FaqItem {
  question: string;
  answer: string;
}

interface GuideItem {
  title: string;
  description: string;
  iconPath: string;
  iconBg: string;
  iconColor: string;
}

function AccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span className="text-sm font-semibold text-gray-800 pr-4">{item.question}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-5 pb-4 pt-0">
          <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function HelpCenter() {
  const { auth } = usePage<SharedData>().props;
  const user = auth?.user;
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const guides: GuideItem[] = [
    {
      title: 'Mengelola Profil',
      description: 'Pelajari cara memperbarui informasi profil, mengganti foto, dan mengatur preferensi akun Anda.',
      iconPath: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Mengunggah Prestasi',
      description: 'Panduan langkah demi langkah untuk mendokumentasikan dan mengunggah pencapaian akademik Anda.',
      iconPath: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-500',
    },
    {
      title: 'Co-Library & Co-Guide',
      description: 'Cara mengakses dan menggunakan sumber daya pembelajaran digital yang tersedia di platform.',
      iconPath: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Premium Post',
      description: 'Pelajari cara membuat dan mengelola premium post untuk menampilkan konten unggulan Anda.',
      iconPath: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      title: 'Chatbot AI',
      description: 'Tips menggunakan chatbot AI untuk mendapatkan bantuan dan informasi seputar platform.',
      iconPath: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
      iconBg: 'bg-pink-50',
      iconColor: 'text-pink-500',
    },
    {
      title: 'Keamanan Akun',
      description: 'Panduan menjaga keamanan akun, mengganti kata sandi, dan mengatur privasi profil.',
      iconPath: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
    },
  ];

  const faqs: FaqItem[] = [
    {
      question: 'Bagaimana cara mendaftar akun baru?',
      answer: 'Klik tombol "Register" di halaman utama, lalu isi formulir pendaftaran dengan informasi yang diperlukan seperti nama lengkap, email, NIM, fakultas, dan program studi. Setelah mengisi semua data, klik "Create Account" untuk menyelesaikan pendaftaran.',
    },
    {
      question: 'Bagaimana cara mengunggah prestasi?',
      answer: 'Masuk ke Dashboard, lalu klik menu "Submit Achievement". Isi formulir dengan detail prestasi Anda termasuk judul, deskripsi, kategori, dan lampirkan bukti pendukung. Setelah dikirim, prestasi akan diverifikasi oleh admin sebelum ditampilkan.',
    },
    {
      question: 'Apa itu Premium Post dan bagaimana cara membuatnya?',
      answer: 'Premium Post adalah fitur yang memungkinkan Anda menampilkan konten unggulan dengan visibilitas lebih tinggi di dashboard. Kunjungi menu "Premium Post" di dashboard, buat konten Anda, dan lakukan pembayaran untuk mempublikasikannya.',
    },
    {
      question: 'Bagaimana cara mengakses Co-Library?',
      answer: 'Co-Library dapat diakses melalui menu di dashboard. Di sana Anda akan menemukan koleksi dokumen, materi pembelajaran, dan sumber daya digital yang telah dikurasi untuk mendukung perjalanan akademik Anda.',
    },
    {
      question: 'Bagaimana cara mengubah informasi profil?',
      answer: 'Klik ikon profil Anda di header, lalu pilih "Edit Profile". Di halaman edit profil, Anda dapat memperbarui nama, foto profil, bio, dan informasi akademik lainnya.',
    },
    {
      question: 'Apakah data saya aman di platform ini?',
      answer: 'Ya, kami menerapkan langkah-langkah keamanan yang ketat termasuk enkripsi data dan kontrol akses. Baca Kebijakan Privasi kami untuk informasi lebih detail tentang bagaimana kami melindungi data Anda.',
    },
    {
      question: 'Bagaimana cara menghubungi tim support?',
      answer: 'Anda dapat menghubungi kami melalui halaman Contact Us, atau mengirim email ke support@prodigi-dtc.ac.id. Tim kami akan merespons dalam waktu 1-2 hari kerja.',
    },
  ];

  return (
    <AppLayout>
      <Head title="Help Center" />
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Pusat Bantuan</h1>
              <p className="text-sm text-gray-400 mt-0.5">Temukan jawaban dan panduan penggunaan platform</p>
            </div>
          </div>
        </div>

        {/* Quick Guides */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Panduan Fitur</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.map((guide) => (
              <div
                key={guide.title}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl ${guide.iconBg} ${guide.iconColor} flex items-center justify-center mb-3`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={guide.iconPath} />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{guide.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{guide.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                item={faq}
                isOpen={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? null : index)}
              />
            ))}
          </div>
        </div>

        {/* Still need help */}
        <div className="mt-10 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white shadow-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Masih butuh bantuan?</h3>
          <p className="text-sm text-gray-600 mb-5">Tim support kami siap membantu Anda</p>
          <Link
            href={route('contact-us')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-200/50 hover:shadow-lg transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Hubungi Kami
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
