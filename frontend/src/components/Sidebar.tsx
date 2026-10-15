import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Bell,
  Camera,
  CheckSquare,
  FileText,
  LayoutDashboard,
  Map,
  Settings,
  ShieldAlert,
  TrendingUp,
  Video,
  X,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Live monitoring', path: '/monitoring', icon: Video },
  { name: 'Incidents', path: '/incidents', icon: AlertTriangle },
  { name: 'Hazard reports', path: '/hazards', icon: FileText },
  { name: 'Corrective actions', path: '/actions', icon: CheckSquare },
  { name: 'Zone map', path: '/zones', icon: Map },
  { name: 'Risk intelligence', path: '/risk', icon: ShieldAlert },
  { name: 'Analytics', path: '/analytics', icon: TrendingUp },
  { name: 'Emergency center', path: '/emergency', icon: Bell },
];

const adminNavigation = [
  { name: 'Cameras', path: '/cameras', icon: Camera },
  { name: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onNavigate: () => void;
}

export default function Sidebar({ isOpen, onNavigate }: SidebarProps) {
  const location = useLocation();

  const renderNavigation = (items: typeof navigation) =>
    items.map((item) => {
      const Icon = item.icon;
      const active = location.pathname === item.path;

      return (
        <Link
          key={item.path}
          to={item.path}
          onClick={onNavigate}
          aria-current={active ? 'page' : undefined}
          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            active
              ? 'bg-cyan-400/10 text-cyan-200 ring-1 ring-inset ring-cyan-300/15'
              : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
          }`}
        >
          <Icon
            className={`h-[18px] w-[18px] shrink-0 ${
              active ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-300'
            }`}
            strokeWidth={1.8}
          />
          <span>{item.name}</span>
          {item.path === '/incidents' && (
            <span className="ml-auto rounded-md bg-red-400/10 px-1.5 py-0.5 text-[10px] font-bold text-red-300">
              LIVE
            </span>
          )}
        </Link>
      );
    });

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[272px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0b1220] transition-transform duration-200 md:static md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-[76px] items-center justify-between border-b border-white/[0.07] px-5">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/30">
            <ShieldAlert className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-[15px] font-extrabold tracking-tight text-white">
              Sentinel
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-500">
              Workplace safety
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={onNavigate}
          aria-label="Close navigation menu"
          className="rounded-lg p-2 text-slate-400 hover:bg-white/[0.06] hover:text-white md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 py-5">
        <div className="mb-3 flex items-center justify-between px-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
            Workspace
          </span>
          <Activity className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <div className="space-y-1">{renderNavigation(navigation)}</div>

        <div className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
          Configuration
        </div>
        <div className="space-y-1">{renderNavigation(adminNavigation)}</div>
      </nav>

      <div className="border-t border-white/[0.07] p-4">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-300">
              Demo environment
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Sample data is being used for this workspace.
          </p>
        </div>
        <p className="px-1 pt-3 text-[10px] text-slate-600">Safety Sentinel · v1.0</p>
      </div>
    </aside>
  );
}
