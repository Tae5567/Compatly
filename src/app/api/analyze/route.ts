// src/app/api/analyze/route.ts
// API endpoint for CSS analysis

import { NextRequest, NextResponse } from 'next/server';
import { BASELINE_FEATURES, CSS_TO_FEATURE_MAP, BaselineFeature } from '@/lib/web-features-adapter';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { css } = body;

    if (!css || typeof css !== 'string') {
      return NextResponse.json(
        { error: 'Invalid CSS input' },
        { status: 400 }
      );
    }

    // Parse CSS and detect features
    const detectedFeatures = detectCSSFeatures(css);

    // Categorize features
    interface AnalysisItem {
      cssProperty: string;
      feature: BaselineFeature;
      context: string;
    }
    
    const compatible: AnalysisItem[] = [];
    const warnings: AnalysisItem[] = [];
    const incompatible: AnalysisItem[] = [];

    detectedFeatures.forEach(detected => {
      const item = {
        cssProperty: detected.property,
        feature: detected.feature,
        context: detected.context
      };

      if (detected.feature.status === 'widely-available') {
        compatible.push(item);
      } else if (detected.feature.status === 'newly-available' || detected.feature.status === 'limited') {
        warnings.push(item);
      } else {
        incompatible.push(item);
      }
    });

    // Calculate score
    const totalFeatures = detectedFeatures.length || 1;
    const weights = {
      'widely-available': 1,
      'newly-available': 0.7,
      'limited': 0.3,
      'not-available': 0
    };

    const totalWeight = detectedFeatures.reduce((sum, f) => {
      return sum + (weights[f.feature.status as keyof typeof weights] || 0);
    }, 0);

    const score = Math.round((totalWeight / totalFeatures) * 100);

    // Calculate browser scores
    const browserScores = calculateBrowserScores(detectedFeatures);

    return NextResponse.json({
      success: true,
      data: {
        analysis: {
          compatible,
          warnings,
          incompatible,
          score
        },
        browserScores
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    console.error('CSS analysis error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

interface DetectedFeature {
  property: string;
  feature: BaselineFeature;
  context: string;
}

function detectCSSFeatures(css: string): DetectedFeature[] {
  const features: DetectedFeature[] = [];
  const lines = css.toLowerCase().split('\n');

  // Enhanced detection patterns using the full web-features dataset
  const patterns = [
    { regex: /display:\s*flex/, key: 'flexbox', context: 'Flexbox layout detected' },
    { regex: /display:\s*grid/, key: 'grid', context: 'CSS Grid layout detected' },
    { regex: /\bgap:/, key: 'gap', context: 'Gap property used' },
    { regex: /grid-template-(columns|rows):\s*subgrid/, key: 'subgrid', context: 'CSS Subgrid detected' },
    { regex: /@container/, key: 'container-queries', context: 'Container query detected' },
    { regex: /:has\(/, key: 'has', context: ':has() selector used' },
    { regex: /&\s*\{/, key: 'nesting', context: 'CSS nesting detected' },
    { regex: /backdrop-filter:/, key: 'backdrop-filter', context: 'Backdrop filter applied' },
    { regex: /aspect-ratio:/, key: 'aspect-ratio', context: 'Aspect ratio property used' },
    { regex: /@layer/, key: 'cascade-layers', context: 'Cascade layer detected' },
    { regex: /color-mix\(/, key: 'color-mix', context: 'color-mix() function used' },
    { regex: /scroll-snap-type:/, key: 'css-scroll-snap', context: 'Scroll snap detected' },
    { regex: /(margin-inline|padding-block|margin-block|padding-inline):/, key: 'logical-properties', context: 'Logical properties used' },
    { regex: /view-transition-name:/, key: 'view-transitions-api', context: 'View transition detected' },
    { regex: /anchor-name:/, key: 'css-anchor-positioning', context: 'Anchor positioning used' },
    { regex: /@scope/, key: 'css-cascade-scope', context: 'CSS @scope detected' },
    { regex: /@property/, key: 'at-property', context: '@property detected' },
    { regex: /text-wrap:\s*balance/, key: 'text-wrap-balance', context: 'Text wrap balance used' },
    { regex: /text-wrap:\s*pretty/, key: 'text-wrap-pretty', context: 'Text wrap pretty used' },
  ];

  const cssText = lines.join('\n');

  patterns.forEach(pattern => {
    if (pattern.regex.test(cssText)) {
      const feature = BASELINE_FEATURES[pattern.key];
      if (feature) {
        features.push({
          property: feature.cssProperty,
          feature: feature,
          context: pattern.context
        });
      }
    }
  });

  return features.filter((feature, index, self) =>
    index === self.findIndex(f => f.property === feature.property)
  );
}

function calculateBrowserScores(features: DetectedFeature[]): Record<string, number> {
  const browsers = ['chrome', 'firefox', 'safari', 'edge'];
  const scores: Record<string, number> = {};

  browsers.forEach(browser => {
    const supportedFeatures = features.filter(f => {
      const version = f.feature.browserSupport[browser as keyof typeof f.feature.browserSupport];
      return version && version !== 'Not supported';
    });
    scores[browser] = supportedFeatures.length;
  });

  return scores;
}