import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import { Search, Shield, Star, Calendar, CreditCard, Music } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight">
              Find the right accompanist
              <span className="block text-zinc-500 mt-2">for your exam.</span>
            </h1>
            <p className="mt-6 text-lg text-zinc-600 max-w-2xl">
              Book verified piano accompanists for AMEB and HSC examinations.
              Transparent rates. Secure payments. Trusted reviews.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/search">
                <Button size="lg">
                  <Search className="mr-2 h-5 w-5" />
                  Find a Pianist
                </Button>
              </Link>
              <Link href="/register?role=pianist">
                <Button variant="secondary" size="lg">
                  <Music className="mr-2 h-5 w-5" />
                  Join as a Pianist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-zinc-50 border-t border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                1. Search or Post
              </h3>
              <p className="text-sm text-zinc-600">
                Browse verified accompanists by experience, location, and availability.
                Or post your requirements and let pianists come to you.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                2. Book Securely
              </h3>
              <p className="text-sm text-zinc-600">
                Select a time that works, share your repertoire details,
                and pay securely through the platform.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                3. Rehearse & Review
              </h3>
              <p className="text-sm text-zinc-600">
                Meet your accompanist, rehearse with confidence,
                and leave a review to help the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-white border-t border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-12">
            Built on Trust
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent>
                <Shield className="h-8 w-8 text-zinc-900 mb-3" />
                <h3 className="text-base font-semibold text-zinc-900 mb-2">
                  Secure Payments
                </h3>
                <p className="text-sm text-zinc-600">
                  Your payment is held securely until the session is completed.
                  Full protection for both parties.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Star className="h-8 w-8 text-zinc-900 mb-3" />
                <h3 className="text-base font-semibold text-zinc-900 mb-2">
                  Verified Reviews
                </h3>
                <p className="text-sm text-zinc-600">
                  Every review comes from a completed booking.
                  Real feedback from real engagements.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <CreditCard className="h-8 w-8 text-zinc-900 mb-3" />
                <h3 className="text-base font-semibold text-zinc-900 mb-2">
                  Transparent Rates
                </h3>
                <p className="text-sm text-zinc-600">
                  See rates upfront. No hidden fees.
                  Pianists always receive their full listed rate.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Pianists CTA */}
      <section className="bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">
              Are you a pianist?
            </h2>
            <p className="text-zinc-400 mb-8">
              Join Tutti Platforms to connect with students and teachers
              across Sydney. Set your own rates, manage your availability,
              and build your professional reputation.
            </p>
            <Link href="/register?role=pianist">
              <Button
                size="lg"
                className="bg-white text-zinc-900 hover:bg-zinc-100"
              >
                Create Your Profile
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
