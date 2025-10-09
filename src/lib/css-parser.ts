// src/lib/css-parser.ts
// Using same baseline data from Figma plugin

import type { BaselineFeature, BaselineStatus } from '@/lib/web-features-adapter';
import { BASELINE_FEATURES } from '@/lib/web-features-adapter';

export interface ParsedCSSFeature {
  property: string;
  value: string;
  category: string;
  line?: number;
}

export interface ParsedCSS {
  features: ParsedCSSFeature[];
  raw: string;
}

export interface CompatibilityResult {
  feature: BaselineFeature;
  cssProperty: string;
  context?: string;
}

export interface AnalysisResult {
  compatible: CompatibilityResult[];
  warnings: CompatibilityResult[];
  incompatible: CompatibilityResult[];
  score: number;
}

export class CSSParser {
  private css: string;

  constructor(css: string) {
    this.css = css;
  }

  parse(): ParsedCSS {
    const features: ParsedCSSFeature[] = [];
    const lines = this.css.split('\n');

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('//')) {
        return;
      }

      // Extract property: value pairs
      const match = trimmed.match(/^\s*([a-z-]+)\s*:\s*([^;]+);?/i);
      if (match) {
        const [, property, value] = match;
        features.push({
          property: property.trim(),
          value: value.trim(),
          category: this.categorizeProperty(property.trim()),
          line: index + 1
        });
      }

      // Check for @ rules
      if (trimmed.startsWith('@')) {
        const atRuleMatch = trimmed.match(/@([a-z-]+)/i);
        if (atRuleMatch) {
          features.push({
            property: `@${atRuleMatch[1]}`,
            value: trimmed,
            category: 'at-rule',
            line: index + 1
          });
        }
      }

      // Check for selectors
      if (trimmed.includes(':has(')) {
        features.push({
          property: ':has()',
          value: trimmed,
          category: 'selector',
          line: index + 1
        });
      }
    });

    return {
      features,
      raw: this.css
    };
  }

  private categorizeProperty(property: string): string {
    if (property.startsWith('@')) return 'at-rule';
    if (property.includes('grid')) return 'layout';
    if (property.includes('flex')) return 'layout';
    if (property.includes('gap')) return 'layout';
    if (property.includes('color')) return 'color';
    if (property.includes('filter')) return 'visual-effects';
    if (property.includes('transform')) return 'transform';
    if (property.includes('margin') || property.includes('padding')) return 'spacing';
    if (property.includes('border')) return 'border';
    return 'other';
  }
}

export class BaselineChecker {
  private baselineFeatures: Record<string, BaselineFeature>;

  constructor(baselineFeatures?: Record<string, BaselineFeature>) {
    this.baselineFeatures = baselineFeatures || {};
  }

  analyzeCSS(parsedCSS: ParsedCSS): AnalysisResult {
    const compatible: CompatibilityResult[] = [];
    const warnings: CompatibilityResult[] = [];
    const incompatible: CompatibilityResult[] = [];

    // Check each parsed feature against baseline database
    parsedCSS.features.forEach(cssFeature => {
      const matchedFeature = this.findMatchingBaselineFeature(cssFeature);
      
      if (matchedFeature) {
        const result: CompatibilityResult = {
          feature: matchedFeature,
          cssProperty: `${cssFeature.property}: ${cssFeature.value}`,
          context: cssFeature.line ? `Line ${cssFeature.line}` : undefined
        };

        switch (matchedFeature.status) {
          case 'widely-available':
            compatible.push(result);
            break;
          case 'newly-available':
          case 'limited':
            warnings.push(result);
            break;
          case 'not-available':
            incompatible.push(result);
            break;
        }
      }
    });

    const score = this.calculateScore(compatible, warnings, incompatible);

    return {
      compatible,
      warnings,
      incompatible,
      score
    };
  }

  private findMatchingBaselineFeature(cssFeature: ParsedCSSFeature): BaselineFeature | null {
    // Direct property match
    for (const [key, feature] of Object.entries(this.baselineFeatures)) {
      const featureProp = feature.cssProperty.toLowerCase();
      const cssProp = cssFeature.property.toLowerCase();
      const cssValue = cssFeature.value.toLowerCase();

      // Check if property matches
      if (featureProp.includes(cssProp)) {
        return feature;
      }

      // Special cases
      if (cssProp === 'display') {
        if (cssValue.includes('flex') && key === 'flexbox') {
          return feature;
        }
        if (cssValue.includes('grid') && key === 'grid') {
          return feature;
        }
      }

      if (cssProp === 'gap' && key === 'gap') {
        return feature;
      }

      if (cssProp.startsWith('@container') || cssProp === '@container') {
        if (key === 'container-queries') return feature;
      }

      if (cssProp.includes('backdrop-filter') && key === 'backdrop-filter') {
        return feature;
      }

      if (cssProp === 'aspect-ratio' && key === 'aspect-ratio') {
        return feature;
      }

      if (cssProp.startsWith('@layer') && key === 'cascade-layers') {
        return feature;
      }

      if (cssFeature.value.includes('color-mix') && key === 'color-mix') {
        return feature;
      }

      if (cssProp.includes('scroll-snap') && key === 'scroll-snap') {
        return feature;
      }

      if ((cssProp.includes('margin-inline') || cssProp.includes('padding-block')) && key === 'logical-properties') {
        return feature;
      }

      if (cssProp.includes('view-transition') && key === 'view-transitions') {
        return feature;
      }

      if (cssProp.includes('anchor') && key === 'anchor-positioning') {
        return feature;
      }
    }

    return null;
  }

  private calculateScore(
    compatible: CompatibilityResult[],
    warnings: CompatibilityResult[],
    incompatible: CompatibilityResult[]
  ): number {
    const total = compatible.length + warnings.length + incompatible.length;
    if (total === 0) return 100;

    const weights = {
      compatible: 1,
      warning: 0.5,
      incompatible: 0
    };

    const weightedScore = 
      (compatible.length * weights.compatible) +
      (warnings.length * weights.warning) +
      (incompatible.length * weights.incompatible);

    return Math.round((weightedScore / total) * 100);
  }
}

export function generateReport(parsedCSS: ParsedCSS, analysis: AnalysisResult): string {
  return `
# CSS Baseline Compatibility Report

## Summary
- Total Features Analyzed: ${parsedCSS.features.length}
- Compatible Features: ${analysis.compatible.length}
- Features with Warnings: ${analysis.warnings.length}
- Incompatible Features: ${analysis.incompatible.length}
- Overall Score: ${analysis.score}/100

## Compatible Features
${analysis.compatible.map(f => `- ${f.feature.name} (${f.cssProperty})`).join('\n') || 'None'}

## Warnings
${analysis.warnings.map(f => `- ${f.feature.name}: ${f.feature.description}${f.feature.fallback ? ` | Fallback: ${f.feature.fallback}` : ''}`).join('\n') || 'None'}

## Incompatible Features
${analysis.incompatible.map(f => `- ${f.feature.name}: ${f.feature.description}`).join('\n') || 'None'}
  `.trim();
}