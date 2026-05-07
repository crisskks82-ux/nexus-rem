import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MessageSquare, Film, BarChart2, Activity, Zap, Code, Star } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';

export default function NexusDashboard() {
  const [tasks, setTasks] = useState([]);
  const [apis, setApis] = useState([]);
  const [state, setState] = useState({ stage: 1, mood: 'feliz', totalConversations: 0, apisCreated: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: t } = await supabase.from('generated_content').select('*').order('created_at', { ascending: false }).limit(10);
      const { data: a } = await supabase.from('generated_content').select('*', { count: 'exact', head: true }).eq('type', 'api');
      const { data: s } = await supabase.from('rem_personality').select('*').order('id', { ascending: false }).limit(1);
      setTasks(t || []);
      setApis(a || []);
      if (s?.[0]) setState({ stage: s[0].evolution_stage || 1, mood: s[0].mood || 'feliz', totalConversations: s[0].total_conversations || 0, apisCreated: a?.length || 0 });
    } catch (e) {}
  };

  const STATS = [
    { label: 'Conversaciones', value: state.totalConversations, icon: MessageSquare, color: '#00ddff', glow: 'rgba(0,221,255,0.3)' },
    { label: 'APIs Creadas', value: state.apisCreated, icon: Code, color: '#9944ff', glow: 'rgba(153,68,255,0.3)' },
    { label: 'Etapa', value: state.stage, icon: Sparkles, color: '#ff44aa', glow: 'rgba(255,68,170,0.3)' },
    { label: 'Ánimo', value: state.mood === 'feliz' ? '😊 Feliz' : '🤔 Pensativa', icon: Star, color: '#ffbb33', glow: 'rgba(255,187,51,0.3)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', fontFamily: 'Inter' }}>
      {/* Header */}
      <div className="glass" style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #00ddff, #9944ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold', boxShadow: '0 0 30px rgba(0,221,255,0.4)' }}>
            R
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #00ddff, #ff44aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              NexusAI Control Center
            </h1>
            <p style={{ fontSize: 13, color: '#666', margin: '4px 0 0' }}>
              ✦ Ecosistema de IA Autónoma — Rem Supervisora
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/chat" className="btn-cyber" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <MessageSquare size={18} /> Hablar con Rem
          </Link>
          <Link to="/video" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 14, fontSize: 14, fontWeight: 600, background: 'rgba(255,68,170,0.15)', border: '1px solid rgba(255,68,170,0.3)', color: '#ff44aa', transition: 'all 0.3s' }}>
            <Film size={18} /> Video IA
          </Link>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
          {STATS.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-card" style={{ padding: 24, cursor: 'default' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: `0 0 20px ${stat.glow}` }}>
                  <Icon size={22} color={stat.color} />
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: '#888' }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tareas recientes */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={20} color="#00ddff" /> Actividad Reciente
          </h2>
          {tasks.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>Sin actividad aún. ¡Habla con Rem para empezar!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.slice(0, 8).map(task => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: task.type === 'video' ? '#ff44aa' : task.type === 'image' ? '#ffbb33' : '#00ddff' }} />
                  <span style={{ flex: 1, fontSize: 14, color: '#ccc' }}>{task.title || 'Sin título'}</span>
                  <span style={{ fontSize: 11, color: '#555', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 8 }}>
                    {task.type?.toUpperCase() || 'TEXT'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: 32, color: '#444', fontSize: 13 }}>
          ✦ Rem — IA 100% Independiente · Sin créditos · Sin APIs externas · v1.0
        </div>
      </div>
    </div>
  );
}