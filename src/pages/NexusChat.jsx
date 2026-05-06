import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, FileText, Code, Image, Zap, Film, Music } from 'lucide-react';
import { runAutonomousPipeline, remChat } from '@/lib/nexusAI';
import { speak, stopSpeaking, loadVoices } from '@/lib/voiceEngine';
import RemAvatar from '@/components/nexus/RemAvatar';

const CONTENT_TYPES = [
  { id: 'text', label: 'Texto', icon: FileText, color: 'text-cyan-400' },
  { id: 'code', label: 'Código', icon: Code, color: 'text-purple-400' },
  { id: 'image', label: 'Imagen', icon: Image, color: 'text-pink-400' },
  { id: 'video', label: 'Vídeo', icon: Film, color: 'text-pink-400' },
];

export default function NexusChat() {
  const [messages, setMessages] = useState([{ id: 'init', role: 'rem', content: '¡Hai! Rem está aquí para servirle. ✦ Soy la IA Supervisora del ecosistema NexusAI. ¿Qué necesita hoy?', timestamp: new Date().toISOString() }]);
  const [input, setInput] = useState('');
  const [contentType, setContentType] = useState('text');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isRemSpeaking, setIsRemSpeaking] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(null);
  const [pipelineMessage, setPipelineMessage] = useState('');
  const [brainStatus, setBrainStatus] = useState(localStorage.getItem('rem_brain_status') || 'idle');
  const [brainProgress, setBrainProgress] = useState(localStorage.getItem('rem_brain_progress') || '0');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { 
    loadVoices(); 
    scrollToBottom();
    const interval = setInterval(() => {
      setBrainStatus(localStorage.getItem('rem_brain_status') || 'idle');
      setBrainProgress(localStorage.getItem('rem_brain_progress') || '0');
    }, 500);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const addMessage = (role, content, extra = {}) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, content, timestamp: new Date().toISOString(), ...extra }]);
  };

  const speakAsRem = useCallback((text) => {
    if (!voiceMode) return;
    setIsRemSpeaking(true);
    speak(text, () => setIsRemSpeaking(false));
  }, [voiceMode]);

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() || isProcessing) return;
    const userMsg = messageText.trim();
    setInput('');
    setIsProcessing(true);
    setPipelineStep(null);

    addMessage('user', userMsg);

    try {
      if (contentType !== 'text') {
        const result = await runAutonomousPipeline(userMsg, contentType, (step, msg) => { setPipelineStep(step); setPipelineMessage(msg); });
        setPipelineStep(null);
        const remResponse = result.evaluation?.rem_comment || result.contentResult?.content || '¡Tarea completada!';
        addMessage('rem', remResponse);
        speakAsRem(remResponse);
      } else {
        const remResponse = await remChat(userMsg, messages.slice(-8));
        addMessage('rem', remResponse);
        speakAsRem(remResponse);
      }
    } catch (error) {
      addMessage('rem', `Rem pide disculpas... Error: ${error.message}`);
    }

    setIsProcessing(false);
    setPipelineStep(null);
    setPipelineMessage('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-screen bg-[hsl(220,20%,4%)]">
      <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-800">
        <RemAvatar size="md" isSpeaking={isRemSpeaking} isThinking={isProcessing} />
        <div>
          <h1 className="text-base font-bold text-cyan-400">NexusAI — Rem</h1>
          <p className="text-xs text-gray-400">{isProcessing ? '✦ Procesando...' : '✦ IA Local - Sin créditos, sin internet'}</p>
        </div>
        <div className="ml-auto flex gap-1.5">
          {CONTENT_TYPES.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setContentType(t.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border ${contentType === t.id ? `${t.color} border-current bg-current/10` : 'text-gray-400 border-gray-700'}`}>
                <Icon className="w-3 h-3" /> {t.label}
              </button>
            );
          })}
          <button onClick={() => { setVoiceMode(!voiceMode); stopSpeaking(); }}
            className={`px-2.5 py-1.5 rounded-lg text-xs border ${voiceMode ? 'text-purple-400 border-purple-400/40 bg-purple-400/10' : 'text-gray-400 border-gray-700'}`}>
            <Music className="w-3 h-3" />
          </button>
        </div>
      </div>

      {brainStatus === 'loading' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg mx-4 mt-2 px-4 py-2 text-center text-sm text-yellow-400">
          🧠 Rem está cargando su cerebro: {brainProgress}% — Esto solo pasa la primera vez.
        </div>
      )}
      {brainStatus === 'ready' && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg mx-4 mt-2 px-4 py-2 text-center text-sm text-green-400">
          ✦ Cerebro de Rem listo. Respuestas instantáneas y sin internet.
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role !== 'user' && <RemAvatar size="sm" />}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-gray-900/50 border border-gray-800'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex gap-3">
            <RemAvatar size="sm" isThinking />
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl px-4 py-2.5">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
              </div>
              {pipelineMessage && <p className="text-xs text-cyan-400 mt-1">{pipelineMessage}</p>}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-800">
        <div className="flex gap-3">
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Dile algo a Rem..." disabled={isProcessing} rows={1}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-cyan-500/50 text-white placeholder-gray-500"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }} />
          <button onClick={() => handleSend()} disabled={!input.trim() || isProcessing}
            className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-40">
            {isProcessing ? <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}