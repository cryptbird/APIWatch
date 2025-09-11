import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Header: org name + user avatar + logout.
 */
export function TopBar(): React.ReactElement {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-14 shrink-0 border-b border-white/10 bg-sidebar/50 flex items-center justify-between px-4">
      <div className="font-mono text-white/70 text-sm" />
      <div className="flex items-center gap-3">
        <span className="text-white/80 text-sm truncate max-w-[180px]">{user?.email}</span>
        <button
          type="button"
          onClick={handleLogout}
          className="text-white/60 hover:text-white text-xs font-mono"
        >
          Log out
        </button>
        <div
          className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-accent font-mono text-sm"
          title={user?.email}
        >
          {user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
      </div>
    </header>
  );
}
