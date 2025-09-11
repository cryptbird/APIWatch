import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { OrgSelector } from './OrgSelector';

const navItems: { to: string; label: string; badge?: 'notifications' }[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/graph', label: 'Graph' },
  { to: '/apis', label: 'APIs' },
  { to: '/notifications', label: 'Notifications', badge: 'notifications' },
  { to: '/teams', label: 'Teams' },
  { to: '/settings', label: 'Settings' },
];

interface SidebarProps {
  collapsed?: boolean;
}

/**
 * Dark industrial sidebar: deep charcoal, amber accent for active, JetBrains Mono.
 */
export function Sidebar({ collapsed = false }: SidebarProps): React.ReactElement {
  const location = useLocation();

  return (
    <aside
      className={`shrink-0 bg-sidebar border-r border-white/10 flex flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-56'}`}
      data-testid="sidebar"
    >
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between gap-2">
          {!collapsed && (
            <Link to="/dashboard" className="font-mono text-accent font-semibold text-lg truncate">
              APIWatch
            </Link>
          )}
          {collapsed && (
            <Link to="/dashboard" className="font-mono text-accent text-xl mx-auto" title="APIWatch">
              A
            </Link>
          )}
        </div>
        {!collapsed && (
          <div className="mt-2">
            <OrgSelector />
          </div>
        )}
      </div>
      <nav className="p-2 flex-1 space-y-0.5">
        {navItems.map(({ to, label, badge }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-3 py-2 rounded font-mono text-sm ${isActive ? 'bg-accent/20 text-accent' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
            >
              {badge === 'notifications' ? (
                <span className="relative">
                  <BellIcon />
                  <UnreadBadge />
                </span>
              ) : (
                <NavIcon to={to} />
              )}
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function BellIcon(): React.ReactElement {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function UnreadBadge(): React.ReactElement {
  const count = 0; // 6.16: notificationStore unread count
  if (count === 0) return <></>;
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-danger text-white text-xs font-mono">
      {count > 99 ? '99+' : count}
    </span>
  );
}

function NavIcon({ to }: { to: string }): React.ReactElement {
  const icons: Record<string, React.ReactElement> = {
    '/dashboard': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6h6m-3 3v6" />
      </svg>
    ),
    '/graph': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    '/apis': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    '/teams': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    '/settings': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 2.31.826 1.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 2.31-2.37 1.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-2.31-.826-1.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-2.31 2.37-1.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  };
  return icons[to] ?? <span className="w-5 h-5 block" />;
}
