'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function RealtimeNotifications() {
  const { user } = useAuth();
  const supabase = createClient();
  
  // 👉 1. We need a state to hold the actual Profile IDs
  const [profileIds, setProfileIds] = useState({ client: null, pianist: null });

  // 👉 2. Fetch the Profile IDs when the user logs in
  useEffect(() => {
    if (!user) return;

    const fetchProfiles = async () => {
      // Get Client Profile ID
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      // Get Pianist Profile ID
      const { data: pianistProfile } = await supabase
        .from('pianist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      setProfileIds({
        client: clientProfile?.id || null,
        pianist: pianistProfile?.id || null
      });
    };

    fetchProfiles();
  }, [user, supabase]);

  // 👉 3. Set up the Realtime Listener
  useEffect(() => {
    // Wait until we have the profile IDs before listening!
    if (!user || (!profileIds.client && !profileIds.pianist)) return;

    const channel = supabase
      .channel('realtime-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          const booking = payload.new;

          // Make sure we have data
          if (!booking || Object.keys(booking).length === 0) return;

          // 👉 4. THE FIX: Compare against the PROFILE IDs, not the Auth ID!
          if (booking.client_id === profileIds.client || booking.pianist_id === profileIds.pianist) {
            
            if (payload.eventType === 'INSERT') {
              toast.success('You have a new booking request!', { icon: '🎉', duration: 6000 });
            } else if (payload.eventType === 'UPDATE') {
              if (booking.status === 'accepted') {
                toast.success('A booking was accepted!', { icon: '✅' });
              } else if (booking.status === 'cancelled') {
                toast.error('A booking was cancelled.', { icon: '❌' });
              } else {
                toast('Booking status updated.', { icon: '🔔' });
              }
            }

            // Tell the dashboard to instantly reload its data!
            window.dispatchEvent(new Event('refresh-bookings'));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profileIds, supabase]);

  return null; 
}