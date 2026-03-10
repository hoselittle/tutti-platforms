'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  User,
  Search,
  PlusCircle,
  ClipboardList,
  Calendar,
} from 'lucide-react';

const navItems = [
  {
    label: 'Dashboard',
    href: '/client/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Profile',
    href: '/client/profile/edit',
    icon: User,
  },
  {
    label: 'Find Pianists',
    href: '/search',
    icon: Search,
  },
  {
    label: 'Post a Job',
    href: '/client/post-job',
    icon: PlusCircle,
  },
  {
    label: 'My Jobs',
    href: '/client/jobs',
    icon: ClipboardList,
  },
  {
    label: 'Bookings',
    href: '/client/bookings',
    icon: Calendar,
  },
];

export default function ClientNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
              isActive
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}