'use client';
import { usePresence } from './PresenceProvider';
import Image from 'next/image';

export default function PresenceAvatars() {
  const users = usePresence();
  if (users.length === 0) return null;
  return (
    <div className="absolute top-2 right-2 flex -space-x-2">
      {users.map((u) => (
        <Image
          key={u.id}
          src={u.avatar_url || '/default-avatar.png'}
          alt={u.name || 'User'}
          title={u.name}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full border-2 border-white"
        />
      ))}
    </div>
  );
}
