'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/client/dashboard' },
  { label: 'Profile', href: '/client/profile/edit' },
  { label: 'Post a Job', href: '/client/post-job' },
  { label: 'My Jobs', href: '/client/jobs' },
  { label: 'Bookings', href: '/client/bookings' },
];

export default function ClientNav({ isMobile, onLinkClick }) {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => {
        // Match exact route, or nested routes (like /client/jobs/123)
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={cn(
              'transition-colors',
              isMobile ? 'block py-2 text-sm' : 'text-sm',
              isActive
                ? 'text-zinc-900 font-semibold' // Active state
                : 'text-zinc-600 hover:text-zinc-900' // Inactive state
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}