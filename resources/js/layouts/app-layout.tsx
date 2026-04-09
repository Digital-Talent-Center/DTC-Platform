import Header from '@/components/Header';
import Footer from '@/components/Footer';
import React from 'react';

// Layout baru ini lebih generik dan bebas dari kerangka sidebar bawaan starter kit,
// sangat cocok untuk membungkus custom UI dari framework eksternal.
interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-background font-sans antialiased text-foreground">
            <Header />
            <main className="flex-1 w-full flex flex-col">
                {children}
            </main>
            <Footer />
        </div>
    );
}
