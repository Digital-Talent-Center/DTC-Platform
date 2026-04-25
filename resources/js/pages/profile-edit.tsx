import { useState } from 'react';
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";

export default function ProfileEditPage() {
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });

  const profileData = {
    name: 'Arrijal Julfa Arrasyid',
    role: 'HUMAN CAPITAL',
    email: 'abcxyz123@gmail.com',
    nim: '1234567890',
    faculty: 'Informatika',
    studyProgram: 'S1 Informatika',
    batchYear: '2023',
    whatsapp: '1234567890',
    linkedin: 'https://www.linkedin.com/in/username',
    instagram: 'https://www.instagram.com/username',
  };

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  return (
    <AppLayout>
      <Head title="Edit Profile" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">

        {/* Page Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left: Profile Info */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Profile Header */}
              <div className="p-6 sm:p-8 flex items-center gap-5 border-b border-gray-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                  AA
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
                  <span className="inline-block mt-1 px-3 py-0.5 text-[10px] font-bold tracking-wider rounded-full bg-amber-500 text-white">
                    {profileData.role}
                  </span>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-gray-400 mb-1.5">EMAIL ADDRESS</label>
                    <p className="text-sm font-medium text-gray-900">{profileData.email}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-gray-400 mb-1.5">NIM</label>
                    <p className="text-sm font-medium text-gray-900">{profileData.nim}</p>
                  </div>

                  <div className="sm:col-span-2 border-t border-gray-100 pt-5" />

                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-gray-400 mb-1.5">FACULTY</label>
                    <p className="text-sm font-medium text-gray-900">{profileData.faculty}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-gray-400 mb-1.5">STUDY PROGRAM</label>
                    <p className="text-sm font-medium text-gray-900">{profileData.studyProgram}</p>
                  </div>

                  <div className="sm:col-span-2 border-t border-gray-100 pt-5" />

                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-gray-400 mb-1.5">BATCH YEAR</label>
                    <p className="text-sm font-medium text-gray-900">{profileData.batchYear}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-gray-400 mb-1.5">WHATSAPP</label>
                    <p className="text-sm font-medium text-gray-900">{profileData.whatsapp}</p>
                  </div>

                  <div className="sm:col-span-2 border-t border-gray-100 pt-5" />

                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-gray-400 mb-1.5">LINKEDIN</label>
                    <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors">
                      {profileData.linkedin}
                    </a>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider text-gray-400 mb-1.5">INSTAGRAM</label>
                    <a href={profileData.instagram} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors">
                      {profileData.instagram}
                    </a>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <div className="mt-8">
                  <Link href="/profile" className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-full shadow-sm transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Change Password */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 h-fit">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Change Password</h2>
              <p className="text-sm text-gray-400 mb-6">Enter a new password for your account.</p>

              <div className="space-y-4">
                {/* Old Password */}
                <div>
                  <label className="block text-[10px] font-semibold tracking-wider text-gray-400 mb-2">OLD PASSWORD</label>
                  <div className="relative">
                    <input
                      type={showPassword.old ? 'text' : 'password'}
                      placeholder="Enter current password"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(prev => ({ ...prev, old: !prev.old }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <EyeIcon />
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[10px] font-semibold tracking-wider text-gray-400 mb-2">NEW PASSWORD</label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? 'text' : 'password'}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <EyeIcon />
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[10px] font-semibold tracking-wider text-gray-400 mb-2">CONFIRM NEW PASSWORD</label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <EyeIcon />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-right">
                <button className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-full shadow-sm transition-all">
                  Save Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
