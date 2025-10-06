//src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Code, AlertCircle, CheckCircle, Info, Download, Share2, Sparkles, ExternalLink } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AIAssistant from '@/components/AIAssistant';

// Types
type BaselineStatus = 'widely-available' | 'newly-available' | 'limited' | 'not-available';

interface BrowserSupport {
  chrome?: string | null;
  firefox?: string | null;
  safari?: string | null;
  edge?: string | null;
}

interface BaselineFeature {
  name: string;
  key: string;
  status: BaselineStatus;
  since?: string | null;
  chrome?: string | null;
  firefox?: string | null;
  safari?: string | null;
  edge?: string | null;
  fallback?: string;
  context?: string;
  browserSupport?: BrowserSupport;
}

interface AnalysisState {
  features: BaselineFeature[];
  score: number;
  browserScores: Record<string, number>;
  statusCount: Record<BaselineStatus, number>;
  totalFeatures: number;
  warnings: BaselineFeature[];
}

const App = () => {
  const [activeTab, setActiveTab] = useState('input');
  const [cssInput, setCssInput] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [loading, setLoading] = useState(false);

  // Listen for Figma plugin data
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'figma-plugin-data') {
        const pluginData = event.data.data;
        if (pluginData?.cssCode) {
          setCssInput(pluginData.cssCode);
          // Auto-analyze if we have CSS from plugin
          setTimeout(() => {
            analyzeCSS();
          }, 500);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Parse URL params for shared data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        if (parsed.css) {
          setCssInput(parsed.css);
        }
      } catch (e) {
        console.error('Failed to parse URL data');
      }
    }
  }, []);

  const analyzeCSS = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ css: cssInput })
      });

      const result = await response.json();

      if (result.success) {
        // Transform API response to match component state
        const { analysis: apiAnalysis } = result.data;
        
        const features: BaselineFeature[] = [
          ...apiAnalysis.compatible,
          ...apiAnalysis.warnings,
          ...apiAnalysis.incompatible
        ].map((item: any) => ({
          ...item.feature,
          key: item.cssProperty,
          context: item.context,
          chrome: item.feature.browserSupport?.chrome || null,
          firefox: item.feature.browserSupport?.firefox || null,
          safari: item.feature.browserSupport?.safari || null,
          edge: item.feature.browserSupport?.edge || null,
        }));

        const statusCount: Record<BaselineStatus, number> = {
          'widely-available': apiAnalysis.compatible.length,
          'newly-available': apiAnalysis.warnings.filter((w: any) => w.feature.status === 'newly-available').length,
          'limited': apiAnalysis.warnings.filter((w: any) => w.feature.status === 'limited').length,
          'not-available': apiAnalysis.incompatible.length
        };

        setAnalysis({
          features,
          score: apiAnalysis.score,
          browserScores: result.data.browserScores,
          statusCount,
          totalFeatures: features.length,
          warnings: features.filter(f => f.status !== 'widely-available')
        });

        setActiveTab('results');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: BaselineStatus }) => {
    const colors: Record<BaselineStatus, string> = {
      'widely-available': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'newly-available': 'bg-blue-100 text-blue-800 border-blue-300',
      'limited': 'bg-amber-100 text-amber-800 border-amber-300',
      'not-available': 'bg-red-100 text-red-800 border-red-300'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[status]}`}>
        {status.replace('-', ' ')}
      </span>
    );
  };

  const exportReport = () => {
    if (!analysis) return;
    const report = {
      timestamp: new Date().toISOString(),
      score: analysis.score,
      features: analysis.features,
      browserScores: analysis.browserScores
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baseline-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareReport = () => {
    if (!analysis) return;
    const shareData = {
      css: cssInput.slice(0, 500),
      score: analysis.score
    };
    const encoded = encodeURIComponent(JSON.stringify(shareData));
    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  const loadSampleCSS = () => {
    const sample = `.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  aspect-ratio: 16 / 9;
}

.card {
  display: flex;
  backdrop-filter: blur(10px);
  border-radius: 12px;
  transform: translateY(0);
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-4px);
}

@container (min-width: 400px) {
  .card {
    padding: 2rem;
  }
}`;
    setCssInput(sample);
  };

  // Prepare context for AI Assistant
  const aiContext = analysis ? {
    analysis: {
      compatible: analysis.features
        .filter(f => f.status === 'widely-available')
        .map(f => ({
          feature: {
            name: f.name,
            description: `${f.name} is widely available across browsers`
          }
        })),
      warnings: analysis.features
        .filter(f => f.status === 'newly-available' || f.status === 'limited')
        .map(f => ({
          feature: {
            name: f.name,
            description: f.fallback || `${f.name} has ${f.status} support`
          }
        })),
      incompatible: analysis.features
        .filter(f => f.status === 'not-available')
        .map(f => ({
          feature: {
            name: f.name,
            description: f.fallback || `${f.name} is not available in baseline`
          }
        })),
      score: analysis.score
    }
  } : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Compatly</h1>
                <p className="text-sm text-slate-600">CSS Baseline Compatibility Analyzer</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a 
                href="https://web.dev/baseline" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                About Baseline
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['input', 'results', 'insights'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={tab !== 'input' && !analysis}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-slate-600 hover:bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-slate-900">CSS Input</h2>
                </div>
                <button
                  onClick={loadSampleCSS}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  Load Sample
                </button>
              </div>
              <textarea
                value={cssInput}
                onChange={(e) => setCssInput(e.target.value)}
                placeholder="Paste your CSS code here..."
                className="w-full h-96 p-4 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button
                onClick={analyzeCSS}
                disabled={!cssInput.trim() || loading}
                className="mt-4 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {loading ? 'Analyzing...' : 'Analyze CSS'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">What is Baseline?</h3>
                    <p className="text-sm text-slate-700 leading-relaxed mb-3">
                      Baseline is a web platform initiative that identifies which web features are safe to use across browsers. Features are marked as widely available when supported in the last 2.5 years across Chrome, Edge, Firefox, and Safari.
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      This tool analyzes your CSS and checks each feature against the Baseline database to help you understand browser compatibility.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-3">Features</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Instant CSS analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Browser compatibility heatmap</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Fallback recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Export & share reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>AI Assistant for CSS help</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && analysis && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-8 border border-blue-100">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-5xl font-bold shadow-xl mb-4">
                  {analysis.score}
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Baseline Compatibility Score</h2>
                <p className="text-slate-600">
                  {analysis.score >= 80 ? 'Excellent! Your CSS is highly compatible.' :
                   analysis.score >= 60 ? 'Good! Minor compatibility concerns.' :
                   'Caution needed. Several features have limited support.'}
                </p>
              </div>
            </div>

            {/* Browser Support Chart */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Browser Support</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: 'Chrome', features: analysis.browserScores.chrome },
                    { name: 'Firefox', features: analysis.browserScores.firefox },
                    { name: 'Safari', features: analysis.browserScores.safari },
                    { name: 'Edge', features: analysis.browserScores.edge }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="features" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Widely Available', value: analysis.statusCount['widely-available'], color: '#10b981' },
                        { name: 'Newly Available', value: analysis.statusCount['newly-available'], color: '#3b82f6' },
                        { name: 'Limited', value: analysis.statusCount['limited'], color: '#f59e0b' },
                        { name: 'Not Available', value: analysis.statusCount['not-available'], color: '#ef4444' }
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {[{ color: '#10b981' }, { color: '#3b82f6' }, { color: '#f59e0b' }, { color: '#ef4444' }].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Detected Features ({analysis.totalFeatures})</h3>
                <div className="flex gap-2">
                  <button onClick={exportReport} className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button onClick={shareReport} className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {analysis.features.map((feature, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{feature.name}</h4>
                          <StatusBadge status={feature.status} />
                        </div>
                        <p className="text-sm text-slate-600 font-mono">{feature.key}</p>
                      </div>
                    </div>
                    
                    {feature.context && (
                      <p className="text-sm text-slate-600 mb-2">{feature.context}</p>
                    )}
                    
                    <div className="flex gap-4 text-xs text-slate-500">
                      {feature.chrome && <span>Chrome {feature.chrome}+</span>}
                      {feature.firefox && <span>Firefox {feature.firefox}+</span>}
                      {feature.safari && <span>Safari {feature.safari}+</span>}
                      {feature.edge && <span>Edge {feature.edge}+</span>}
                    </div>
                    
                    {feature.fallback && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                        <strong>Fallback:</strong> {feature.fallback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && analysis && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Key Insights</h3>
              
              {analysis.warnings.length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-2">
                        {analysis.warnings.length} Feature{analysis.warnings.length !== 1 ? 's' : ''} Need Attention
                      </h4>
                      <ul className="space-y-1 text-sm text-amber-800">
                        {analysis.warnings.slice(0, 5).map((feature, idx) => (
                          <li key={idx}>• {feature.name} - {feature.status}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <h4 className="font-semibold text-emerald-900 mb-2">Browser Coverage</h4>
                  <p className="text-sm text-emerald-800">
                    Your CSS has {analysis.score}% baseline compatibility. This means most features work across modern browsers.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Recommendations</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Test in Safari if using newly-available features</li>
                    <li>• Consider progressive enhancement for limited-support features</li>
                    <li>• Use feature queries (@supports) for fallbacks</li>
                    {analysis.score < 80 && <li>• Review features with limited browser support</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Assistant - Only show when analysis is available */}
      {analysis && <AIAssistant analysisContext={aiContext} />}
    </div>
  );
};

export default App;