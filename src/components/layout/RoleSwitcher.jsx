'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Music, UserSearch, ArrowRightLeft, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RoleSwitcher() {
  const {
    activeRole,
    switchRole,
    activateRole,
    hasPianistRole,
    hasClientRole,
    hasBothRoles,
    loading,
  } = useAuth();

  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activating, setActivating] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading || !activeRole) return null;

  const currentRoleLabel = activeRole === 'pianist' ? 'Pianist Mode' : 'Client Mode';
  const CurrentIcon = activeRole === 'pianist' ? Music : UserSearch;

  const handleSwitchRole = (newRole) => {
    switchRole(newRole);
    setIsOpen(false);
  };

  const handleActivateRole = async (newRole) => {
    setActivating(true);
    const success = await activateRole(newRole);
    setActivating(false);
    setIsOpen(false);

    if (success) {
      if (newRole === 'pianist') {
        router.push('/pianist/profile/edit?new=true');
      } else {
        router.push('/client/profile/edit?new=true');
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
          activeRole === 'pianist'
            ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        )}
      >
        <CurrentIcon className="h-3.5 w-3.5" />
        {currentRoleLabel}
        <ArrowRightLeft className="h-3 w-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-zinc-200 py-2 z-50">
          <div className="px-3 py-1.5 mb-1">
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">
              Switch Mode
            </p>
          </div>

          {/* Pianist Option */}
          {hasPianistRole && (
            <button
              onClick={() => handleSwitchRole('pianist')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                activeRole === 'pianist'
                  ? 'bg-purple-50 text-purple-900 font-medium'
                  : 'text-zinc-600 hover:bg-zinc-50'
              )}
            >
              <Music className="h-4 w-4" />
              <div className="text-left">
                <p>Pianist Mode</p>
                <p className="text-xs text-zinc-400">
                  Manage bookings & availability
                </p>
              </div>
              {activeRole === 'pianist' && (
                <span className="ml-auto text-xs text-purple-600">Active</span>
              )}
            </button>
          )}

          {/* Client Option */}
          {hasClientRole && (
            <button
              onClick={() => handleSwitchRole('client')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                activeRole === 'client'
                  ? 'bg-blue-50 text-blue-900 font-medium'
                  : 'text-zinc-600 hover:bg-zinc-50'
              )}
            >
              <UserSearch className="h-4 w-4" />
              <div className="text-left">
                <p>Client Mode</p>
                <p className="text-xs text-zinc-400">
                  Find pianists & manage bookings
                </p>
              </div>
              {activeRole === 'client' && (
                <span className="ml-auto text-xs text-blue-600">Active</span>
              )}
            </button>
          )}

          {/* Add Second Role */}
          {!hasBothRoles && (
            <>
              <div className="border-t border-zinc-100 my-1" />

              {!hasPianistRole && (
                <button
                  onClick={() => handleActivateRole('pianist')}
                  disabled={activating}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  <Plus className="h-4 w-4 text-zinc-400" />
                  <div className="text-left">
                    <p>{activating ? 'Activating...' : 'Become a Pianist'}</p>
                    <p className="text-xs text-zinc-400">
                      Offer accompaniment services
                    </p>
                  </div>
                </button>
              )}

              {!hasClientRole && (
                <button
                  onClick={() => handleActivateRole('client')}
                  disabled={activating}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  <Plus className="h-4 w-4 text-zinc-400" />
                  <div className="text-left">
                    <p>{activating ? 'Activating...' : 'Become a Client'}</p>
                    <p className="text-xs text-zinc-400">
                      Find and book accompanists
                    </p>
                  </div>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}