// src/lib/web-features-adapter.ts

import { features as webFeatures } from 'web-features';

export type BaselineStatus = 'widely-available' | 'newly-available' | 'limited' | 'not-available';

export interface BaselineFeature {
  name: string; 
  cssProperty: string;
  status: BaselineStatus;
  availableSince?: string;
  description: string;
  fallback?: string;
  browserSupport: {
    chrome?: string;
    firefox?: string;
    safari?: string;
    edge?: string;
  };
  group?: string;
  spec?: string;
}

// Define the structure expected from web-features
interface WebFeatureData {
  name: string;
  description?: string;
  spec?: string;
  group?: string;
  compat_features?: string[];
  status?: {
    baseline?: boolean | "low" | "high";
    baseline_low_date?: string;
    baseline_high_date?: string;
    support?: {
      chrome?: string;
      chrome_android?: string;
      edge?: string;
      firefox?: string;
      firefox_android?: string;
      safari?: string;
      safari_ios?: string;
    };
  };
}

// Type guard to check if feature has the data needed
function isValidFeature(feature: any): feature is WebFeatureData {
  return (
    feature &&
    typeof feature === 'object' &&
    'name' in feature &&
    'status' in feature &&
    feature.status &&
    typeof feature.status === 'object'
  );
}

// Convert web-features baseline status to status type
function convertBaselineStatus(baseline: boolean | "low" | "high" | undefined): BaselineStatus {
  if (baseline === false) return 'not-available';
  if (baseline === 'low') return 'newly-available';
  if (baseline === 'high') return 'widely-available';
  return 'limited';
}

// Build a searchable index from web-features
export function buildFeatureIndex(): Record<string, BaselineFeature> {
  const index: Record<string, BaselineFeature> = {};

  Object.entries(webFeatures).forEach(([featureId, featureData]) => {
    // Skip features that don't have the expected structure
    if (!isValidFeature(featureData)) {
      console.warn(`Skipping feature ${featureId}: invalid structure`);
      return;
    }

    const status = convertBaselineStatus(featureData.status?.baseline);
    const support = featureData.status?.support || {};

    // Generate a reasonable cssProperty string from compat_features
    let cssProperty = featureId;
    if (featureData.compat_features && featureData.compat_features.length > 0) {
      cssProperty = featureData.compat_features[0]
        .replace('css.properties.', '')
        .replace('css.selectors.', '')
        .replace('css.types.', '');
    }

    index[featureId] = {
      name: featureData.name,
      cssProperty: cssProperty,
      status: status,
      availableSince: featureData.status?.baseline_low_date || featureData.status?.baseline_high_date,
      description: featureData.description || `${featureData.name} feature`,
      browserSupport: {
        chrome: support.chrome,
        firefox: support.firefox,
        safari: support.safari,
        edge: support.edge,
      },
      group: featureData.group,
      spec: featureData.spec,
    };
  });

  console.log(`Loaded ${Object.keys(index).length} features from web-features package`);
  return index;
}

// CSS property to feature ID mapping (for detection)
// These map common CSS patterns to web-features IDs
export const CSS_TO_FEATURE_MAP: Record<string, string> = {
  'display: flex': 'flexbox',
  'display: grid': 'grid',
  'gap': 'gap',
  'grid-template-columns: subgrid': 'subgrid',
  'grid-template-rows: subgrid': 'subgrid',
  '@container': 'container-queries',
  ':has': 'has',
  'nesting': 'nesting',
  'backdrop-filter': 'backdrop-filter',
  'aspect-ratio': 'aspect-ratio',
  '@layer': 'cascade-layers',
  'color-mix': 'color-mix',
  'scroll-snap-type': 'scroll-snap',
  'margin-inline': 'logical-properties',
  'padding-block': 'logical-properties',
  'view-transition-name': 'view-transitions',
  'anchor-name': 'anchor-positioning',
  '@scope': 'scope',
  '@property': 'at-property',
  'text-wrap: balance': 'text-wrap-balance',
  'text-wrap: pretty': 'text-wrap-pretty',
};

export const BASELINE_FEATURES = buildFeatureIndex();