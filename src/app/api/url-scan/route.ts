// src/app/api/url-scan/route.ts
//Implement scanning css from website URLS to check Baseline score and features***
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Compatly CSS Analyzer Bot/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const css = extractCSSFromPage(html);

    // Use the analyze endpoint
    const analyzeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ css })
    });

    const analysisResult = await analyzeResponse.json();

    return NextResponse.json({
      success: true,
      data: {
        url,
        css,
        ...analysisResult.data,
        scannedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('URL scan error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function extractCSSFromPage(html: string): string {
  let css = '';
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  
  while ((match = styleRegex.exec(html)) !== null) {
    css += match[1] + '\n\n';
  }

  return css;
}