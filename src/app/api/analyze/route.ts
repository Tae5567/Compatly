// app/api/analyze/route.ts
// API endpoint for CSS analysis

import { NextRequest, NextResponse } from 'next/server';
import { CSSParser, BaselineChecker, generateReport, AnalysisResult } from '@/lib/css-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { css, options } = body;

    if (!css || typeof css !== 'string') {
      return NextResponse.json(
        { error: 'Invalid CSS input' },
        { status: 400 }
      );
    }

    const parser = new CSSParser(css);
    const parsedCSS = parser.parse();

    const checker = new BaselineChecker();
    const analysis = checker.analyzeCSS(parsedCSS);

    const report = generateReport(parsedCSS, analysis);
    const browserScores = calculateBrowserScores(analysis);

    return NextResponse.json({
      success: true,
      data: {
        parsedCSS,
        analysis,
        report,
        browserScores,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function calculateBrowserScores(analysis: AnalysisResult): Record<string, number> {
  const browsers = ['chrome', 'firefox', 'safari', 'edge'] as const;
  const scores: Record<string, number> = {};

  browsers.forEach(browser => {
    let supported = 0;
    let total = 0;

    [...analysis.compatible, ...analysis.warnings, ...analysis.incompatible].forEach(result => {
      total++;
      if (result.feature.browserSupport[browser]) {
        supported++;
      }
    });

    scores[browser] = total > 0 ? Math.round((supported / total) * 100) : 100;
  });

  return scores;
}