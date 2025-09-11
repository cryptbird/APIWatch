import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, type AuthUser } from '../store/authStore';
import { useOrgStore } from '../store/orgStore';

/**
 * Login: email + password, JWT stored in memory (Zustand). Demo mode: accept any and set token.
 */
export function Login(): React.ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setOrgs = useOrgStore((s) => s.setOrgs);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Email required');
      return;
    }
    // Demo: no backend JWT yet; create a mock token and user. Auto-refresh can be added later.
    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: 'user-1', email, exp: Date.now() / 1000 + 86400 }))}.sig`;
    const user: AuthUser = {
      id: 'user-1',
      email: email.trim(),
      name: email.split('@')[0],
      orgIds: ['org-1', 'org-2'],
    };
    setAuth(mockToken, user);
    setOrgs(user.orgIds.map((id) => ({ id, name: id })));
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm rounded-lg bg-sidebar border border-white/10 p-6 shadow-xl">
        <h1 className="text-2xl font-mono text-accent mb-2 text-center">APIWatch</h1>
        <p className="text-white/70 text-sm text-center mb-6">Sign in to the dashboard</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded bg-background border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded bg-background border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 rounded font-medium bg-accent text-background hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            Sign in
          </button>
        </form>
        <p className="text-white/50 text-xs text-center mt-4">Demo: any email/password signs in.</p>
      </div>
    </div>
  );
}
