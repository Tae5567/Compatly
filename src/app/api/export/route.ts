// src/app/api/export/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST_Export(request: NextRequest) {
  try {
    const body = await request.json();
    const { format, data } = body;

    if (!['json', 'pdf', 'markdown'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format' },
        { status: 400 }
      );
    }

    let exportData: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'json':
        exportData = JSON.stringify(data, null, 2);
        contentType = 'application/json';
        filename = `baseline-report-${Date.now()}.json`;
        break;
      
      case 'markdown':
        exportData = generateMarkdownReport(data);
        contentType = 'text/markdown';
        filename = `baseline-report-${Date.now()}.md`;
        break;
      
      case 'pdf':
        exportData = generateMarkdownReport(data);
        contentType = 'application/pdf';
        filename = `baseline-report-${Date.now()}.pdf`;
        break;
      
      default:
        throw new Error('Unsupported format');
    }

    return new NextResponse(exportData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Export error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function generateMarkdownReport(data: any): string {
  return `
# CSS Baseline Compatibility Report

**Generated**: ${new Date().toISOString()}
**Score**: ${data.analysis?.score || 0}/100

## Summary

- Total Features: ${data.parsedCSS?.features?.length || 0}
- Compatible: ${data.analysis?.compatible?.length || 0}
- Warnings: ${data.analysis?.warnings?.length || 0}
- Incompatible: ${data.analysis?.incompatible?.length || 0}

## Browser Support

| Browser | Support Score |
|---------|---------------|
| Chrome  | ${data.browserScores?.chrome || 0}% |
| Firefox | ${data.browserScores?.firefox || 0}% |
| Safari  | ${data.browserScores?.safari || 0}% |
| Edge    | ${data.browserScores?.edge || 0}% |

## Detected Features

${data.parsedCSS?.features?.map((f: any) => 
  `- **${f.property}**: ${f.value} (${f.category})`
).join('\n') || 'No features detected'}

## Recommendations

${data.analysis?.warnings?.length > 0 ? 
  'Some features have limited browser support. Consider providing fallbacks.' : 
  'All features are widely supported!'}
  `.trim();
}