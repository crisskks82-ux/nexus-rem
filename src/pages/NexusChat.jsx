import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, FileText, Code, Image, Film, Music } from 'lucide-react';
import { remChat, generateVideo, generateImage } from '@/lib/nexusAI';
import { speak, stopSpeaking, loadVoices } from '@/lib/voiceEngine';

const CONTENT_TYPES = [
  { id: 'text', label: 'Chat', icon: FileText, color: '#00ddff' },
  { id: 'code', label: 'Código', icon: Code, color: '#9944ff' },
  { id: 'image', label: 'Imagen', icon: Image, color: '#ff44aa' },
  { id: 'video', label: 'Video', icon: Film, color: '#ff44aa' },
];

export default function NexusChat() {
  const [messages, setMessages] = useState([{
    id: 'init', role: 'rem',
    content: '✦ Hai, Goshujin-sama. Rem está aquí para servirle con todo su corazón. ¿Qué desea hoy?',
    timestamp: new Date().toISOString()
  }]);
  const [input, setInput] = useState('');
  const [contentType, setContentType] = useState('text');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { loadVoices(); scrollToBottom(); }, []);
  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const addMessage = (role, content, extra = {}) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, content, timestamp: new Date().toISOString(), ...extra }]);
  };

  const speakAsRem = useCallback((text) => {
    if (!voiceMode) return;
    speak(text);
  }, [voiceMode]);

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() || isProcessing) return;
    const userMsg = messageText.trim();
    setInput('');
    setIsProcessing(true);
    addMessage('user', userMsg);

    try {
      if (contentType === 'video') {
        const result = await generateVideo(userMsg);
        addMessage('rem', result.message, { video_url: result.video_url, hasVideo: true });
        speakAsRem(result.message);
      } else if (contentType === 'image') {
        const result = await generateImage(userMsg);
        addMessage('rem', result.message, { image_url: result.image_url, hasImage: true });
        speakAsRem(result.message);
      } else {
        const response = await remChat(userMsg);
        addMessage('rem', response);
        speakAsRem(response);
      }
    } catch (error) {
      addMessage('rem', `Gomen nasai... Error: ${error.message}`);
    }

    setIsProcessing(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative' }}>
      {/* Header */}
      <div className="glass" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #00ddff, #9944ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 'bold', boxShadow: '0 0 30px rgba(0,221,255,0.4)' }}>
          R
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#00ddff', margin: 0 }}>Rem — NexusAI</h1>
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
            {isProcessing ? '✦ Procesando...' : voiceMode ? '✦ Voz activada' : '✦ IA Independiente — Sin créditos'}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {CONTENT_TYPES.map(t => {
            const Icon = t.icon;
            const active = contentType === t.id;
            return (
              <button key={t.id} onClick={() => setContentType(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12,
                  fontSize: 13, fontWeight: 600, border: active ? `2px solid ${t.color}` : '1px solid rgba(255,255,255,0.08)',
                  background: active ? `${t.color}20` : 'rgba(255,255,255,0.02)', color: active ? t.color : '#888',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
          <button onClick={() => { setVoiceMode(!voiceMode); stopSpeaking(); }}
            style={{
              padding: '8px 14px', borderRadius: 12, fontSize: 13, cursor: 'pointer',
              background: voiceMode ? '#ff44aa30' : 'rgba(255,255,255,0.02)',
              border: voiceMode ? '1px solid #ff44aa' : '1px solid rgba(255,255,255,0.08)',
              color: voiceMode ? '#ff44aa' : '#888'
            }}>
            <Music size={14} />
          </button>
        </div>
      </div>

      {/* Mensajes */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map(msg => (
          <div key={msg.id} className="animate-slide-up" style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 12 }}>
            {msg.role === 'rem' && (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #ff44aa, #9944ff)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold' }}>
                R
              </div>
            )}
            <div style={{ maxWidth: '70%' }}>
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-rem'} style={{ padding: '14px 18px', fontSize: 14, lineHeight: 1.6, color: '#ddd' }}>
                {msg.content}
              </div>
              {msg.hasVideo && msg.video_url && (
                <video src={msg.video_url} controls style={{ marginTop: 8, borderRadius: 16, width: '100%', maxWidth: 320, border: '1px solid rgba(255,255,255,0.1)' }} />
              )}
              {msg.hasImage && msg.image_url && (
                <img src={msg.image_url} alt="Rem" style={{ marginTop: 8, borderRadius: 16, width: '100%', maxWidth: 320, border: '1px solid rgba(255,255,255,0.1)' }} />
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #ff44aa, #9944ff)', animation: 'pulse-glow 2s infinite' }} />
            <div style={{ display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ddff', animation: `float 0.6s ${i*0.1}s ease-in-out infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass" style={{ padding: '16px 24px', borderRadius: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje para Rem..."
            disabled={isProcessing}
            className="input-cyber"
            style={{ flex: 1, minHeight: 50, maxHeight: 120, resize: 'none', fontFamily: 'Inter' }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }} />
          <button onClick={() => handleSend()} disabled={!input.trim() || isProcessing}
            className="btn-cyber" style={{ width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
            {isProcessing ? (
              <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'float 0.8s linear infinite' }} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}