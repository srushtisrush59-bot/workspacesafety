import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (dateString: string, formatStr: string = 'MMM dd, yyyy'): string => {
  return format(new Date(dateString), formatStr);
};

export const formatDateTime = (dateString: string): string => {
  return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
};

export const formatTimeAgo = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

export const formatSeverity = (severity: string): string => {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};

export const formatIncidentType = (type: string): string => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    critical: 'badge-critical',
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
  };
  return colors[severity.toLowerCase()] || 'badge-info';
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    new: 'badge-critical',
    acknowledged: 'badge-high',
    assigned: 'badge-medium',
    investigating: 'badge-medium',
    resolved: 'badge-success',
    closed: 'badge-info',
    open: 'badge-high',
    in_progress: 'badge-medium',
    blocked: 'badge-critical',
    completed: 'badge-success',
    verified: 'badge-success',
  };
  return colors[status.toLowerCase()] || 'badge-info';
};

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    critical: 'badge-critical',
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
  };
  return colors[priority.toLowerCase()] || 'badge-info';
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return value.toFixed(decimals) + '%';
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat().format(value);
};
