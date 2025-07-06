'use client';
import { usePresence } from './PresenceProvider';

export default function PresenceAvatars() {
  const users = usePresence();
  if (users.length === 0) return null;
  return (
    <div className="absolute top-2 right-2 flex -space-x-2">
      {users.map((u) => (
        <img
          key={u.id}
          src={u.avatar_url || '/default-avatar.png'}
          alt={u.name}
          title={u.name}
          className="w-8 h-8 rounded-full border-2 border-white"
        />
      ))}
    </div>
  );
}
