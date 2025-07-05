'use client';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Announcement {
  id: string;
  message: string;
  start_time: string;
  end_time: string | null;
}

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const now = new Date().toISOString();
    supabase
      .from('announcements')
      .select('*')
      .lte('start_time', now)
      .or(`end_time.is.null,end_time.gt.${now}`)
      .order('start_time', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setAnnouncement(data as Announcement);
      });
  }, [supabase]);

  if (!announcement) return null;
  return (
    <div className="bg-blue-600 text-white text-center py-2 px-4 text-sm">
      {announcement.message}
    </div>
  );
}
