import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';

/**
 * Main layout: dark industrial sidebar + top bar + content.
 */
export function AppLayout(): React.ReactElement {
  return (
    <div className="flex min-h-screen bg-background text-white font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
