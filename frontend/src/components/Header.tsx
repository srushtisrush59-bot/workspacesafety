import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, User } from 'lucide-react';
import { healthCheck } from '../services/api';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [search, setSearch] = useState('');
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'healthy' | 'degraded' | 'offline'>('checking');
  const navigate = useNavigate();

  useEffect(() => {
    healthCheck()
      .then((health) => setServiceStatus(health.status === 'healthy' ? 'healthy' : 'degraded'))
      .catch(() => setServiceStatus('offline'));
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/incidents?search=${encodeURIComponent(query)}` : '/incidents');
  };

  return (
    <header className="z-20 flex h-[76px] shrink-0 items-center justify-between gap-3 border-b border-white/[0.07] bg-slate-950/90 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-xl border border-white/[0.08] p-2 text-slate-300 transition-colors hover:bg-white/[0.06] md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <form onSubmit={handleSearch} className="relative w-full max-w-[430px]">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search incidents..."
            aria-label="Search incidents"
            className="h-10 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] pl-10 pr-16 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-300/40 focus:bg-white/[0.05] focus:ring-2 focus:ring-cyan-300/10"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/[0.08] px-1.5 py-0.5 text-[10px] text-slate-500 sm:block">
            Enter
          </kbd>
        </form>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div
          title="Connection status for the safety API"
          className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 sm:flex ${
            serviceStatus === 'healthy'
              ? 'border-emerald-400/15 bg-emerald-400/[0.06]'
              : serviceStatus === 'offline'
                ? 'border-red-400/15 bg-red-400/[0.06]'
                : 'border-amber-400/15 bg-amber-400/[0.06]'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              serviceStatus === 'healthy'
                ? 'animate-pulse-slow bg-emerald-400'
                : serviceStatus === 'offline'
                  ? 'bg-red-400'
                  : 'bg-amber-400'
            }`}
          />
          <span
            className={`text-xs font-medium ${
              serviceStatus === 'healthy'
                ? 'text-emerald-300'
                : serviceStatus === 'offline'
                  ? 'text-red-300'
                  : 'text-amber-300'
            }`}
          >
            {serviceStatus === 'healthy'
              ? 'API connected'
              : serviceStatus === 'offline'
                ? 'API offline'
                : serviceStatus === 'degraded'
                  ? 'API degraded'
                  : 'Connecting'}
          </span>
        </div>
        <Link
          to="/emergency"
          aria-label="Open emergency center"
          title="Emergency center"
          className="relative rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-400 ring-2 ring-slate-950" />
        </Link>
        <div className="h-8 w-px bg-white/[0.08]" />
        <button
          type="button"
          title="Signed in as Sarah Chen"
          className="flex items-center gap-2.5 rounded-xl p-1.5 pr-0.5 transition-colors hover:bg-white/[0.04] sm:pr-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-200">
            <User className="h-[18px] w-[18px]" />
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-semibold text-slate-200">Sarah Chen</span>
            <span className="mt-0.5 block text-[10px] text-slate-500">Safety officer</span>
          </span>
        </button>
      </div>
    </header>
  );
}
