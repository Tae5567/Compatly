// app/api/ai-assistant/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(context);
    const fullPrompt = `${systemPrompt}\n\nUser question: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking for faster responses
        },
      }
    });

    const text = response.text;

    return NextResponse.json({
      success: true,
      data: {
        response: text,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'AI request failed';
    console.error('AI Assistant error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

interface AnalysisContext {
  analysis?: {
    compatible?: Array<{
      feature: {
        name: string;
        description?: string;
      };
    }>;
    warnings?: Array<{
      feature: {
        name: string;
        description?: string;
      };
    }>;
    incompatible?: Array<{
      feature: {
        name: string;
        description?: string;
      };
    }>;
    score?: number;
  };
}

function buildSystemPrompt(context?: AnalysisContext): string {
  let prompt = `You are an expert CSS and web development assistant specializing in browser compatibility and the Baseline web standards initiative.

Your role is to:
1. Explain CSS features and their browser compatibility status
2. Recommend fallback strategies for features with limited support
3. Provide practical code examples and solutions
4. Help developers understand the Baseline standard
5. Suggest best practices for cross-browser compatibility

When answering questions:
- Be concise but thorough
- Include code examples when relevant
- Cite specific browser versions when discussing compatibility
- Prioritize modern, standards-based solutions
- Explain the "why" behind compatibility issues`;

  if (context?.analysis) {
    const compatibleCount = context.analysis.compatible?.length || 0;
    const warningsCount = context.analysis.warnings?.length || 0;
    const incompatibleCount = context.analysis.incompatible?.length || 0;
    const totalFeatures = compatibleCount + warningsCount + incompatibleCount;

    prompt += `\n\nCurrent analysis context:
- Total features detected: ${totalFeatures}
- Compatible features: ${compatibleCount}
- Features with warnings: ${warningsCount}
- Incompatible features: ${incompatibleCount}
- Overall score: ${context.analysis.score || 0}/100`;

    if (warningsCount > 0) {
      prompt += `\n\nWarnings found:`;
      context.analysis.warnings?.forEach((w) => {
        prompt += `\n- ${w.feature.name}${w.feature.description ? `: ${w.feature.description}` : ''}`;
      });
    }
  }

  return prompt;
}