'use client';
import { usePresence } from './PresenceProvider';
import LazyImage from './LazyImage';


export default function PresenceAvatars() {
  const users = usePresence();
  if (users.length === 0) return null;
  return (
    <div className="absolute top-2 right-2 flex -space-x-2">
      {users.map((u) => {
        const src =
          u.avatar_url ||
          `https://avatars.dicebear.com/api/initials/${encodeURIComponent(
            u.name || 'U'
          )}.svg`;
        return (
          <LazyImage
            key={u.id}
            src={src}
            alt={u.name || 'User'}
            title={u.name}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full border-2 border-white"
          />
        );
      })}
    </div>
  );
}

