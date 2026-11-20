import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

const titleMap = {
  '/dashboard': 'Dashboard',
  '/job-listing': 'Job Listing',
  '/roles': 'Roles',
  '/candidates': 'Candidate Listing',
  '/hirings': 'Hiring Records',
};

const STORAGE_KEY = 'rms.sidebar.collapsed';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const location = useLocation();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // ignore storage errors
    }
  }, [collapsed]);

  const matched = Object.keys(titleMap).find((path) => location.pathname.startsWith(path));
  const title = titleMap[matched] || 'Admin';

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
      />
      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 lg:p-4">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
