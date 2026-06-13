import { Link } from '@inertiajs/react';

export default function Footer() {
  const footerLinks = [
    { label: 'PRIVACY POLICY', href: route('privacy-policy') },
    { label: 'TERMS OF SERVICE', href: route('terms-of-service') },
    { label: 'HELP CENTER', href: route('help-center') },
    { label: 'CONTACT US', href: route('contact-us') },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left — Logo + tagline */}
          <div className="flex items-center gap-4 text-center sm:text-left">
            <img
              src="/images/logo-stacked.png"
              alt="PRODIGI"
              width={48}
              height={48}
              className="h-10 w-auto object-contain hidden sm:block"
            />
            <div>
              <p className="text-sm font-bold tracking-tight text-gray-900">
                Digital Talent Centre
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                © {new Date().getFullYear()} PRODIGI — Inspire Through Creation. All Rights Reserved.
              </p>
            </div>
          </div>

          {/* Right */}
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-medium text-gray-400 tracking-wider hover:text-gray-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
