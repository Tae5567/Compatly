//src/app/api/export/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface ExportData {
  timestamp: string;
  score: number;
  features: Array<{
    name: string;
    status: string;
    cssProperty: string;
  }>;
  browserScores: {
    chrome: number;
    firefox: number;
    safari: number;
    edge: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ExportData;
    
    // Validate the data structure
    if (!body.features || !Array.isArray(body.features)) {
      return NextResponse.json(
        { error: 'Invalid export data' },
        { status: 400 }
      );
    }

    // Generate export report
    const report = {
      generatedAt: new Date().toISOString(),
      compatibilityScore: body.score,
      features: body.features,
      browserSupport: body.browserScores,
      summary: generateSummary(body)
    };

    return NextResponse.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

function generateSummary(data: ExportData): {
  totalFeatures: number;
  widelyAvailable: number;
  newlyAvailable: number;
  limited: number;
} {
  const statusCounts = data.features.reduce((acc, feature) => {
    const status = feature.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalFeatures: data.features.length,
    widelyAvailable: statusCounts['widely-available'] || 0,
    newlyAvailable: statusCounts['newly-available'] || 0,
    limited: statusCounts['limited'] || 0
  };
}