//src/lib/baseline-data.ts
//Baseline feature data

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
}

export const BASELINE_FEATURES: Record<string, BaselineFeature> = {
    'flexbox': {
        name: 'Flexbox',
        cssProperty: 'display: flex',
        status: 'widely-available',
        availableSince: '2015',
        description: 'Flexible box layout for one-dimensional layouts',
        browserSupport: {
        chrome: '29',
        firefox: '28',
        safari: '9',
        edge: '12'
    }
    },
    'grid': {
        name: 'CSS Grid',
        cssProperty: 'display: grid',
        status: 'widely-available',
        availableSince: '2017',
        description: 'Two-dimensional grid-based layout system',
        browserSupport: {
        chrome: '57',
        firefox: '52',
        safari: '10.1',
        edge: '16'
    }
    },
    'gap': {
        name: 'Gap Property',
        cssProperty: 'gap',
        status: 'widely-available',
        availableSince: '2020',
        description: 'Spacing between flex/grid items',
        browserSupport: {
        chrome: '84',
        firefox: '63',
        safari: '14.1',
        edge: '84'
    }
    },
      'subgrid': {
    name: 'CSS Subgrid',
    cssProperty: 'grid-template-columns: subgrid',
    status: 'newly-available',
    availableSince: '2023-09',
    description: 'Nested grids that inherit parent grid tracks',
    fallback: 'Use regular CSS Grid with manual alignment',
    browserSupport: {
      chrome: '117',
      firefox: '71',
      safari: '16',
      edge: '117'
    }
  },
  'container-queries': {
    name: 'Container Queries',
    cssProperty: '@container',
    status: 'newly-available',
    availableSince: '2023-02',
    description: 'Style elements based on container size',
    fallback: 'Use media queries or JavaScript resize observers',
    browserSupport: {
      chrome: '105',
      firefox: '110',
      safari: '16',
      edge: '105'
    }
  },
  'has-selector': {
    name: ':has() Selector',
    cssProperty: ':has()',
    status: 'newly-available',
    availableSince: '2023-12',
    description: 'Parent selector based on descendants',
    fallback: 'Use JavaScript or restructure CSS',
    browserSupport: {
      chrome: '105',
      firefox: '121',
      safari: '15.4',
      edge: '105'
    }
  },
  'nesting': {
    name: 'CSS Nesting',
    cssProperty: '& { }',
    status: 'newly-available',
    availableSince: '2023-12',
    description: 'Native CSS nesting without preprocessors',
    fallback: 'Use Sass/PostCSS or flatten selectors',
    browserSupport: {
      chrome: '120',
      firefox: '117',
      safari: '16.5',
      edge: '120'
    }
  },
  'backdrop-filter': {
    name: 'Backdrop Filter',
    cssProperty: 'backdrop-filter',
    status: 'widely-available',
    availableSince: '2022',
    description: 'Apply filters to area behind element',
    browserSupport: {
      chrome: '76',
      firefox: '103',
      safari: '9',
      edge: '79'
    }
  },
  'aspect-ratio': {
    name: 'Aspect Ratio',
    cssProperty: 'aspect-ratio',
    status: 'widely-available',
    availableSince: '2021',
    description: 'Set preferred aspect ratio for elements',
    fallback: 'Use padding-bottom percentage trick',
    browserSupport: {
      chrome: '88',
      firefox: '89',
      safari: '15',
      edge: '88'
    }
  },
  'cascade-layers': {
    name: 'Cascade Layers',
    cssProperty: '@layer',
    status: 'widely-available',
    availableSince: '2022',
    description: 'Control specificity with named layers',
    browserSupport: {
      chrome: '99',
      firefox: '97',
      safari: '15.4',
      edge: '99'
    }
  },
  'color-mix': {
    name: 'color-mix()',
    cssProperty: 'color-mix()',
    status: 'newly-available',
    availableSince: '2023-06',
    description: 'Mix colors in specified color spaces',
    fallback: 'Use preprocessor color functions or hardcode values',
    browserSupport: {
      chrome: '111',
      firefox: '113',
      safari: '16.2',
      edge: '111'
    }
  },
  'scroll-snap': {
    name: 'Scroll Snap',
    cssProperty: 'scroll-snap-type',
    status: 'widely-available',
    availableSince: '2019',
    description: 'Control scroll position snapping',
    browserSupport: {
      chrome: '69',
      firefox: '68',
      safari: '11',
      edge: '79'
    }
  },
  'logical-properties': {
    name: 'Logical Properties',
    cssProperty: 'margin-inline, padding-block, etc.',
    status: 'widely-available',
    availableSince: '2020',
    description: 'Flow-relative CSS properties',
    browserSupport: {
      chrome: '87',
      firefox: '68',
      safari: '14.1',
      edge: '87'
    }
  },
  'view-transitions': {
    name: 'View Transitions API',
    cssProperty: 'view-transition-name',
    status: 'limited',
    availableSince: 'Not yet',
    description: 'Smooth transitions between page states',
    fallback: 'Use CSS transitions and JavaScript',
    browserSupport: {
      chrome: '111',
      safari: 'Not supported',
      firefox: 'Not supported',
      edge: '111'
    }
  },
  'anchor-positioning': {
    name: 'CSS Anchor Positioning',
    cssProperty: 'anchor-name',
    status: 'limited',
    availableSince: 'Not yet',
    description: 'Position elements relative to anchors',
    fallback: 'Use JavaScript positioning',
    browserSupport: {
      chrome: '125',
      safari: 'Not supported',
      firefox: 'Not supported',
      edge: '125'
    }
  }
    
};

export function getStatusColor(status: BaselineStatus): string {
    switch(status) {
        case 'widely-available':
            return '#10b981'; // green
        case 'newly-available':
            return '#3b82f6'; // blue
        case 'limited':
         return '#f59e0b'; // amber
        case 'not-available':
            return '#ef4444'; // red
        default:
            return '#6b7280'; // gray
    }
}

export function getStatusIcon(status: BaselineStatus): string {
    switch (status) {
    case 'widely-available':
      return '✅';
    case 'newly-available':
      return '🆕';
    case 'limited':
      return '⚠️';
    case 'not-available':
      return '❌';
    default:
      return '❓';
  }
}