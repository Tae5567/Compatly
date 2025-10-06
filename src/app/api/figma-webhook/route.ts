// src/app/api/figma-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CSSParser, BaselineChecker } from '@/lib/css-parser';

interface FigmaFeature {
  nodeName: string;
  featureKey: string;
  value?: string;
}

interface FigmaData {
  features: FigmaFeature[];
  nodeCount?: number;
  nodeName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: FigmaData = await request.json();

    if (!data.features || !Array.isArray(data.features)) {
      return NextResponse.json(
        { error: 'Invalid Figma data structure' },
        { status: 400 }
      );
    }

    const css = convertFigmaToCSS(data);
    const parser = new CSSParser(css);
    const parsedCSS = parser.parse();
    
    const checker = new BaselineChecker();
    const analysis = checker.analyzeCSS(parsedCSS);

    return NextResponse.json({
      success: true,
      data: {
        css,
        parsedCSS,
        analysis,
        figmaMetadata: {
          nodeCount: data.nodeCount || 0,
          nodeName: data.nodeName || 'Figma Design'
        }
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Figma webhook error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function convertFigmaToCSS(figmaData: FigmaData): string {
  let css = '/* Generated from Figma */\n\n';

  figmaData.features.forEach((feature: FigmaFeature) => {
    const className = feature.nodeName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    css += `.${className} {\n`;

    switch (feature.featureKey) {
      case 'flexbox':
        css += '  display: flex;\n';
        if (feature.value?.includes('row')) {
          css += '  flex-direction: row;\n';
        } else {
          css += '  flex-direction: column;\n';
        }
        break;
      
      case 'gap':
        css += `  gap: ${feature.value};\n`;
        break;
      
      case 'grid':
        css += '  display: grid;\n';
        css += '  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n';
        break;
      
      case 'backdrop-filter':
        css += `  backdrop-filter: ${feature.value};\n`;
        css += `  -webkit-backdrop-filter: ${feature.value};\n`;
        break;
      
      case 'aspect-ratio':
        const ratio = feature.value?.replace(':', ' / ');
        css += `  aspect-ratio: ${ratio};\n`;
        break;
      
      case 'border-radius':
        css += `  border-radius: ${feature.value};\n`;
        break;
      
      case 'transform':
        css += `  transform: rotate(${feature.value});\n`;
        break;
    }

    css += '}\n\n';
  });

  return css;
}