export interface AppPreferences {
  compactLayout: boolean;
  reduceMotion: boolean;
  dashboardRefreshSeconds: number;
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  compactLayout: false,
  reduceMotion: false,
  dashboardRefreshSeconds: 0,
};

const STORAGE_KEY = 'safety-sentinel-preferences';
const REFRESH_INTERVALS = [0, 30, 60, 120];

export function readPreferences(): AppPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;

    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_PREFERENCES;

    const candidate = parsed as Partial<AppPreferences>;
    return {
      compactLayout:
        typeof candidate.compactLayout === 'boolean'
          ? candidate.compactLayout
          : DEFAULT_PREFERENCES.compactLayout,
      reduceMotion:
        typeof candidate.reduceMotion === 'boolean'
          ? candidate.reduceMotion
          : DEFAULT_PREFERENCES.reduceMotion,
      dashboardRefreshSeconds:
        typeof candidate.dashboardRefreshSeconds === 'number' &&
        REFRESH_INTERVALS.includes(candidate.dashboardRefreshSeconds)
          ? candidate.dashboardRefreshSeconds
          : DEFAULT_PREFERENCES.dashboardRefreshSeconds,
    };
  } catch (error) {
    console.error('Could not read saved application preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

export function applyPreferences(preferences: AppPreferences) {
  document.documentElement.dataset.density = preferences.compactLayout ? 'compact' : 'comfortable';
  document.documentElement.dataset.motion = preferences.reduceMotion ? 'reduced' : 'full';
}

export function savePreferences(preferences: AppPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  applyPreferences(preferences);
  window.dispatchEvent(new CustomEvent<AppPreferences>('sentinel-preferences-updated', {
    detail: preferences,
  }));
}
