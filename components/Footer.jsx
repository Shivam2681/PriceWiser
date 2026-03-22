import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-1 mb-4">
              <Image 
                src="/assets/icons/logo.svg"
                width={27}
                height={27}
                alt="PriceWiser logo"
              />
              <span className="text-xl font-bold text-gray-900">
                PriceWiser
              </span>
            </Link>

            <p className="text-sm text-gray-600 leading-relaxed">
              Track prices, save money, and make smarter purchasing decisions with AI-powered insights.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>

            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
              </li>

              <li>
                <Link
                  href="/dashboard/favorites"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Favorites
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Legal
            </h3>

            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>

              <li>
                <Link
                  href="/affiliate-disclosure"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Affiliate Disclosure
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Contact
            </h3>

            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>

                <span className="text-sm text-gray-600">
                  Support (Coming Soon)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure Banner */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <div className="flex-1">
                <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                  Affiliate Disclosure
                </h4>

                <p className="text-sm text-yellow-700 leading-relaxed">
                  PriceWiser participates in the Amazon Associates Program, an
                  affiliate advertising program designed to provide a means for
                  sites to earn advertising fees by advertising and linking to
                  Amazon.in. When you purchase through links on our site, we
                  may earn an affiliate commission at no additional cost to
                  you. As an Amazon Associate, we earn from qualifying
                  purchases.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Trademark */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © {currentYear} PriceWiser. All rights reserved.
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>
                Amazon® is a trademark of Amazon.com, Inc. or its affiliates.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}