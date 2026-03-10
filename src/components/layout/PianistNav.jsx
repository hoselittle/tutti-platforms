'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/pianist/dashboard' },
  { label: 'Profile', href: '/pianist/profile/edit' },
  { label: 'Availability', href: '/pianist/availability' },
  { label: 'My Applications', href: '/pianist/applications' },
  { label: 'Bookings', href: '/pianist/bookings' },
  { label: 'Earnings', href: '/pianist/earnings' },
];

export default function PianistNav({ isMobile, onLinkClick }) {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => {
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
                ? 'text-zinc-900 font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}