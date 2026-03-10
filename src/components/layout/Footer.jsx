import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center mb-3">
              <span className="text-lg font-bold text-zinc-900">Tutti</span>
              <span className="text-lg font-light text-zinc-500 ml-1">Platforms</span>
            </div>
            <p className="text-sm text-zinc-500">
              Professional accompanist booking for AMEB and HSC examinations in Sydney.
            </p>
          </div>

          {/* For Clients */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 mb-3">For Clients</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-sm text-zinc-500 hover:text-zinc-900">
                  Find a Pianist
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-zinc-500 hover:text-zinc-900">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-zinc-500 hover:text-zinc-900">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* For Pianists */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 mb-3">For Pianists</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/register" className="text-sm text-zinc-500 hover:text-zinc-900">
                  Join as a Pianist
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="text-sm text-zinc-500 hover:text-zinc-900">
                  Browse Jobs
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-zinc-500 hover:text-zinc-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-zinc-500 hover:text-zinc-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cancellation-policy" className="text-sm text-zinc-500 hover:text-zinc-900">
                  Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-200">
          <p className="text-sm text-zinc-400 text-center">
            © {new Date().getFullYear()} Tutti Platforms. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}