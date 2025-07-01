'use client';
import { useRole } from './RoleProvider';
import type { Role } from './RoleProvider';

export default function RoleSwitcher() {
  const { role, setRole } = useRole();
  return (
    <div className="fixed top-20 right-4 z-50">
      <select
        className="bg-bg-card border border-gray-700 p-2 rounded"
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
      >
        <option value="pm">Project Manager</option>
        <option value="exec">Executive</option>
        <option value="field">Field</option>
      </select>
    </div>
  );
}
