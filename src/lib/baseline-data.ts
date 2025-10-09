// src/lib/baseline-data.ts

export { BASELINE_FEATURES } from './web-features-adapter';
export type { BaselineFeature, BaselineStatus } from './web-features-adapter';

export function getStatusColor(status: string): string {
  switch(status) {
    case 'widely-available': return '#10b981';
    case 'newly-available': return '#3b82f6';
    case 'limited': return '#f59e0b';
    case 'not-available': return '#ef4444';
    default: return '#6b7280';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'widely-available': return '✅';
    case 'newly-available': return '🆕';
    case 'limited': return '⚠️';
    case 'not-available': return '❌';
    default: return '❓';
  }
}