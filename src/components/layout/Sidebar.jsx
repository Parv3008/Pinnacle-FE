import { NavLink } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  Users,
  ClipboardList,
  Tags,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/job-listing', label: 'Job Listing', icon: Building2 },
  { to: '/roles', label: 'Roles', icon: Tags },
  { to: '/hirings', label: 'Hiring Records', icon: ClipboardList },
  { to: '/candidates', label: 'Candidate Listing', icon: Users },
];

function BrandMark({ collapsed = false }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ${
        collapsed ? 'h-10 w-10 p-1' : 'h-11 w-11 p-1.5'
      }`}
    >
      <img
        src="/pinnacle-logo.png"
        alt="Pinnacle Recruitment"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 lg:hidden ${open ? 'block' : 'hidden'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col bg-navy-950 text-slate-200 transition-all duration-300 lg:translate-x-0 ${
          collapsed ? 'lg:w-20 overflow-visible' : 'lg:w-72 overflow-hidden'
        } w-72 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div
          className={`flex shrink-0 items-center border-b border-white/10 py-4 ${
            collapsed ? 'justify-center px-2' : 'justify-between px-5'
          }`}
        >
          <div className={`flex min-w-0 items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <BrandMark collapsed={collapsed} />
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-white">
                  Pinnacle
                </p>
                <p className="truncate text-xs font-medium uppercase tracking-[0.14em] text-teal-300/90">
                  Recruitment
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 hover:bg-white/10 lg:hidden"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <nav
          className={`min-h-0 flex-1 space-y-1 py-4 ${
            collapsed ? 'overflow-visible px-2' : 'overflow-y-auto px-3'
          }`}
        >
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <div key={link.to} className="group relative">
                <NavLink
                  to={link.to}
                  onClick={onClose}
                  title={collapsed ? link.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center rounded-lg text-sm font-medium transition ${
                      collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span className="truncate">{link.label}</span>}
                </NavLink>

                {collapsed && (
                  <span className="pointer-events-none absolute left-full top-1/2 z-[60] ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                    {link.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        <div
          className={`shrink-0 border-t border-white/10 ${
            collapsed ? 'px-2 py-3' : 'px-3 py-3'
          }`}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`group relative hidden w-full items-center rounded-lg py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white lg:flex ${
              collapsed ? 'justify-center px-2' : 'gap-3 px-3'
            }`}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            {!collapsed && <span>Collapse</span>}
            {collapsed && (
              <span className="pointer-events-none absolute left-full top-1/2 z-[60] ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                Expand sidebar
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
