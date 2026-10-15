import { useEffect, useState, type ReactNode } from 'react';
import {
  Check,
  Database,
  HelpCircle,
  LayoutDashboard,
  Monitor,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { API_BASE_URL, healthCheck } from '../services/api';
import {
  applyPreferences,
  DEFAULT_PREFERENCES,
  readPreferences,
  savePreferences,
  type AppPreferences,
} from '../utils/appPreferences';

interface ApiHealth {
  status: string;
  version: string;
  environment: string;
  components: {
    database: string;
    vision_service: string;
    notifications: string;
  };
}

function PreferenceToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-cyan-400' : 'bg-slate-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function PreferenceRow({
  icon: Icon,
  title,
  description,
  control,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2 text-slate-400">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-200">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
        </div>
      </div>
      {control}
    </div>
  );
}

export default function Settings() {
  const [preferences, setPreferences] = useState<AppPreferences>(readPreferences);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [connection, setConnection] = useState<'checking' | 'connected' | 'degraded' | 'offline'>('checking');

  useEffect(() => {
    applyPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    let isCurrent = true;
    healthCheck()
      .then((result: ApiHealth) => {
        if (!isCurrent) return;
        setHealth(result);
        setConnection(result.status === 'healthy' ? 'connected' : 'degraded');
      })
      .catch(() => {
        if (isCurrent) setConnection('offline');
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const updatePreferences = (next: AppPreferences) => {
    try {
      savePreferences(next);
      setPreferences(next);
      setSaved(true);
      setSaveError('');
    } catch (error) {
      console.error('Could not save application preferences:', error);
      setSaved(false);
      setSaveError('Your browser could not save these preferences. Check its storage settings and try again.');
    }
  };

  const resetPreferences = () => updatePreferences(DEFAULT_PREFERENCES);

  const connectionLabel = {
    checking: 'Checking connection',
    connected: 'Connected',
    degraded: 'Degraded',
    offline: 'Offline',
  }[connection];

  const connectionColor = {
    checking: 'text-amber-300',
    connected: 'text-emerald-300',
    degraded: 'text-amber-300',
    offline: 'text-red-300',
  }[connection];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Configuration</span>
            <span className="text-slate-700">/</span>
            <span className="text-cyan-300">Settings</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[30px]">Settings</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Personalize how Safety Sentinel looks and updates on this device.
          </p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-300 sm:self-auto">
            <Check className="h-3.5 w-3.5" />
            Saved on this device
          </span>
        )}
      </div>

      {saveError && (
        <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200">
          {saveError}
        </div>
      )}

      <section className="card p-5 sm:p-6" aria-labelledby="appearance-heading">
        <div className="mb-2 flex items-center gap-3">
          <span className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.08] p-2.5 text-cyan-200">
            <Monitor className="h-5 w-5" />
          </span>
          <div>
            <h2 id="appearance-heading" className="font-semibold text-white">Appearance & accessibility</h2>
            <p className="mt-1 text-xs text-slate-500">Adjust the interface to suit your workspace.</p>
          </div>
        </div>
        <div className="divide-y divide-white/[0.06]">
          <PreferenceRow
            icon={LayoutDashboard}
            title="Compact layout"
            description="Reduce spacing between panels to fit more on screen."
            control={
              <PreferenceToggle
                checked={preferences.compactLayout}
                label="Compact layout"
                onChange={() => updatePreferences({ ...preferences, compactLayout: !preferences.compactLayout })}
              />
            }
          />
          <PreferenceRow
            icon={Sparkles}
            title="Reduce motion"
            description="Turn off decorative animations and transitions."
            control={
              <PreferenceToggle
                checked={preferences.reduceMotion}
                label="Reduce motion"
                onChange={() => updatePreferences({ ...preferences, reduceMotion: !preferences.reduceMotion })}
              />
            }
          />
        </div>
      </section>

      <section className="card p-5 sm:p-6" aria-labelledby="dashboard-heading">
        <div className="mb-2 flex items-center gap-3">
          <span className="rounded-xl border border-violet-300/15 bg-violet-300/[0.08] p-2.5 text-violet-200">
            <RefreshCw className="h-5 w-5" />
          </span>
          <div>
            <h2 id="dashboard-heading" className="font-semibold text-white">Dashboard updates</h2>
            <p className="mt-1 text-xs text-slate-500">Choose how often the overview refreshes its data.</p>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-slate-200">Auto-refresh interval</p>
            <p className="mt-1 text-xs text-slate-500">Only refreshes while the dashboard is open.</p>
          </div>
          <select
            className="select w-full sm:w-48"
            aria-label="Dashboard auto-refresh interval"
            value={preferences.dashboardRefreshSeconds}
            onChange={(event) =>
              updatePreferences({ ...preferences, dashboardRefreshSeconds: Number(event.target.value) })
            }
          >
            <option value={0}>Off</option>
            <option value={30}>Every 30 seconds</option>
            <option value={60}>Every minute</option>
            <option value={120}>Every 2 minutes</option>
          </select>
        </div>
      </section>

      <section className="card p-5 sm:p-6" aria-labelledby="system-heading">
        <div className="mb-5 flex items-center gap-3">
          <span className="rounded-xl border border-emerald-300/15 bg-emerald-300/[0.08] p-2.5 text-emerald-200">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h2 id="system-heading" className="font-semibold text-white">System status</h2>
            <p className="mt-1 text-xs text-slate-500">Connection information for this workspace.</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col justify-between gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 sm:flex-row sm:items-center">
            <span className="text-sm text-slate-400">Safety API</span>
            <span className={`flex items-center gap-2 text-sm font-medium ${connectionColor}`}>
              <span className={`h-2 w-2 rounded-full ${
                connection === 'connected' ? 'bg-emerald-400' :
                  connection === 'offline' ? 'bg-red-400' : 'bg-amber-400'
              }`} />
              {connectionLabel}
            </span>
          </div>
          <div className="flex flex-col justify-between gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 sm:flex-row sm:items-center">
            <span className="text-sm text-slate-400">API address</span>
            <span className="break-all text-sm text-slate-300">{API_BASE_URL}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Database className="h-3.5 w-3.5" /> Database
              </div>
              <p className="mt-2 text-sm font-medium capitalize text-slate-200">
                {health?.components.database || 'Checking'}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="h-3.5 w-3.5" /> Vision service
              </div>
              <p className="mt-2 text-sm font-medium capitalize text-slate-200">
                {health?.components.vision_service || 'Checking'}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <HelpCircle className="h-3.5 w-3.5" /> Environment
              </div>
              <p className="mt-2 text-sm font-medium capitalize text-slate-200">
                {health ? `${health.environment} · v${health.version}` : 'Checking'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col items-start justify-between gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center">
        <p className="text-xs text-slate-500">Preferences are stored locally in this browser.</p>
        <button type="button" onClick={resetPreferences} className="btn-secondary">
          <RotateCcw className="h-4 w-4" />
          Restore defaults
        </button>
      </div>
    </div>
  );
}
