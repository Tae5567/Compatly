// src/lib/api-helpers.ts
// Helper functions for API calls

export interface AnalysisResponse {
  success: boolean;
  data?: {
    analysis: {
      compatible: Array<{
        cssProperty: string;
        feature: {
          name: string;
          status: string;
          description?: string;
          fallback?: string;
          browserSupport?: {
            chrome?: string;
            firefox?: string;
            safari?: string;
            edge?: string;
          };
        };
        context?: string;
      }>;
      warnings: Array<{
        cssProperty: string;
        feature: {
          name: string;
          status: string;
          description?: string;
          fallback?: string;
          browserSupport?: {
            chrome?: string;
            firefox?: string;
            safari?: string;
            edge?: string;
          };
        };
        context?: string;
      }>;
      incompatible: Array<{
        cssProperty: string;
        feature: {
          name: string;
          status: string;
          description?: string;
          fallback?: string;
          browserSupport?: {
            chrome?: string;
            firefox?: string;
            safari?: string;
            edge?: string;
          };
        };
        context?: string;
      }>;
      score: number;
    };
    browserScores: {
      chrome: number;
      firefox: number;
      safari: number;
      edge: number;
    };
  };
  error?: string;
}

export interface AIResponse {
  success: boolean;
  data?: {
    response: string;
    timestamp: string;
  };
  error?: string;
}

/**
 * Analyze CSS code for baseline compatibility
 */
export async function analyzeCSS(css: string): Promise<AnalysisResponse> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ css })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('CSS analysis failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed'
    };
  }
}

/**
 * Ask the AI assistant a question
 */
export async function askAIAssistant(
  message: string,
  context?: any
): Promise<string> {
  try {
    const response = await fetch('/api/ai-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, context })
    });

    if (!response.ok) {
      throw new Error('AI request failed');
    }

    const data: AIResponse = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error(data.error || 'AI request failed');
    }
    
    return data.data.response;
  } catch (error) {
    console.error('AI Assistant error:', error);
    throw error;
  }
}

/**
 * Example prompts for the AI assistant
 */
export const EXAMPLE_PROMPTS = [
  "Why isn't backdrop-filter working in Firefox?",
  "How can I use container queries with a fallback?",
  "What's the difference between newly-available and widely-available?",
  "Should I use CSS Grid or Flexbox for my layout?",
  "How do I provide fallbacks for :has() selector?",
  "What are the best practices for cross-browser compatibility?",
  "Explain CSS cascade layers",
  "How do I handle Safari's lack of support for a feature?"
];