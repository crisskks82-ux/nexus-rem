import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film, Send, Sparkles, Brain, RefreshCw, TrendingUp, Star, Zap, ArrowLeft } from 'lucide-react';
import { runVideoGenerationPipeline, getVideoParams } from '@/lib/videoEngine';
import { base44 } from '@/api/base44Client';
import RemAvatar from '@/components/nexus/RemAvatar';
import { cn } from '@/lib/utils';

export default function NexusVideo() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [phaseMessage, setPhaseMessage] = useState('');
  const [results, setResults] = useState([]);
  const [params, setParams] = useState(getVideoParams());

  const handleGenerate = async (prompt = input) => {
    if (!prompt.trim() || isProcessing) return;
    setInput('');
    setIsProcessing(true);
    setCurrentPhase(null);
    try {
      const result = await runVideoGenerationPipeline(prompt, (phase, message) => {
        setCurrentPhase(phase);
        setPhaseMessage(message);
      });
      setResults(prev => [{ ...result, prompt, timestamp: new Date().toISOString() }, ...prev]);
      setParams(result.params_used);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
      setCurrentPhase(null);
      setPhaseMessage('');
      setParams(getVideoParams());
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(220,20%,4%)] text-white">
      <div className="border-b border-gray-800 p-4 flex items-center gap-3">
        <Link to="/" className="p-1.5 rounded-lg hover:bg-gray-800"><ArrowLeft className="w-4 h-4 text-gray-400" /></Link>
        <Film className="w-5 h-5 text-pink-400" />
        <h1 className="text-lg font-bold text-pink-400">NexusVideo</h1>
        <div className="ml-auto flex items-center gap-2 text-sm text-green-400">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Sistema activo
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 flex gap-6">
        <div className="flex-1 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2"><Brain className="w-4 h-4" /> Estado del Sistema</h2>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Renders', value: params.total_renders, color: 'text-pink-400' },
                { label: 'Duración', value: `${params.duration}s`, color: 'text-yellow-400' },
                { label: 'Racha', value: params.success_streak, color: 'text-green-400' },
                { label: 'Calidad', value: params.total_renders > 0 ? `${params.avg_quality.toFixed(1)}/10` : '—', color: 'text-cyan-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-800/50 rounded-xl p-3">
                  <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-pink-500/30 rounded-xl p-4">
            <div className="flex gap-3">
              <textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                placeholder="Describe el vídeo que quieres generar..." disabled={isProcessing} rows={2}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-pink-500/50 text-white placeholder-gray-500" />
              <button onClick={() => handleGenerate()} disabled={!input.trim() || isProcessing}
                className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/40 flex items-center justify-center text-pink-400 hover:bg-pink-500/20 disabled:opacity-40">
                {isProcessing ? <div className="w-4 h-4 border-2 border-pink-400/30 border-t-pink-400 rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isProcessing && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-pink-400/30 border-t-pink-400 rounded-full animate-spin" />
              <span className="text-sm text-pink-400">{phaseMessage || 'Procesando...'}</span>
            </div>
          )}

          {results.map((result, i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              {result.video_url && (
                <video src={result.video_url} controls className="w-full" style={{ maxHeight: '400px' }} />
              )}
              <div className="p-4">
                <p className="text-sm text-gray-300">{result.prompt}</p>
                {result.evaluation && (
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>★ {result.evaluation.overall_score?.toFixed(1)}/10</span>
                    <span className="text-cyan-400">{result.evaluation.rem_evaluation}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="w-72 hidden lg:block space-y-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
            <RemAvatar size="lg" isThinking={isProcessing} />
            <p className="text-sm font-semibold text-cyan-400 mt-2">Rem Supervisora</p>
            <p className="text-xs text-gray-400">{isProcessing ? 'Generando...' : '¡Lista para crear!'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}