import { Link } from "@inertiajs/react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AuthLayout({ children, title, description, ...props }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-100" {...props}>
      {/* Minimal Header */}
      <div className="px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-3">
          <img
            src="/images/logo-horizontal.png"
            alt="PRODIGI"
            width={160}
            height={44}
            className="h-9 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </div>

      {/* Minimal Footer */}
      <div className="px-6 py-4 text-center flex flex-col items-center gap-2">
        <img
          src="/images/logo-stacked.png"
          alt="PRODIGI"
          width={40}
          height={40}
          className="h-8 w-auto object-contain opacity-40"
        />
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} PRODIGI — Digital Talent Centre. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
