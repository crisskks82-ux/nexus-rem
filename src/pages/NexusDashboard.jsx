import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Activity, CheckCircle, Zap, Code, Star, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NexusDashboard() {
  const [tasks, setTasks] = useState([]);
  const [apis, setApis] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const u1 = base44.entities.Task.subscribe(() => loadData());
    const u2 = base44.entities.GeneratedAPI.subscribe(() => loadData());
    const u3 = base44.entities.AuditLog.subscribe(() => loadData());
    return () => { u1(); u2(); u3(); };
  }, []);

const loadData = async () => {
  try {
    const [t, a, l] = await Promise.all([
      base44.entities.Task.list('-created_date', 100),
      base44.entities.GeneratedAPI.list('-created_date', 50),
      base44.entities.AuditLog.list('-created_date', 200)
    ]);
    // Aseguramos que siempre sean arrays
    setTasks(Array.isArray(t) ? t : (t?.data ? t.data : []));
    setApis(Array.isArray(a) ? a : (a?.data ? a.data : []));
    setLogs(Array.isArray(l) ? l : (l?.data ? l.data : []));
  } catch (e) {
    console.error('Error loading data:', e);
    setTasks([]);
    setApis([]);
    setLogs([]);
  }
  setLoading(false);
};

  const tasksArray = Array.isArray(tasks) ? tasks : [];
  const completedTasks = tasksArray.filter(t => t.status === 'completed').length;
  const processingTasks = tasksArray.filter(t => t.status === 'processing').length;
  const avgQuality = tasksArray.filter(t => t.quality_score).reduce((acc, t) => acc + t.quality_score, 0) / (tasksArray.filter(t => t.quality_score).length || 1);

  const STATS = [
    { label: 'Tareas Completadas', value: completedTasks, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Procesando', value: processingTasks, icon: Zap, color: 'text-yellow-400' },
    { label: 'APIs Generadas', value: Array.isArray(apis) ? apis.length : 0, icon: Code, color: 'text-purple-400' },
    { label: 'Calidad Promedio', value: `${avgQuality.toFixed(1)}/10`, icon: Star, color: 'text-cyan-400' },
    { label: 'Eventos', value: Array.isArray(logs) ? logs.length : 0, icon: Activity, color: 'text-pink-400' },
  ];

  return (
    <div className="min-h-screen bg-[hsl(220,20%,4%)] text-white">
      <div className="border-b border-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h1 className="text-lg font-bold text-cyan-400">NexusAI Control Center</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/video" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-400 text-sm">🎬 Video IA</Link>
          <Link to="/chat" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm">💬 Hablar con Rem</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {STATS.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <div className={`text-xl font-bold ${stat.color}`}>{loading ? '—' : stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-400" /> Tareas Recientes</h2>
            {tasksArray.slice(0, 8).map(task => (
              <div key={task.id} className="flex items-center gap-3 py-2 border-b border-gray-800 text-sm">
                <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span className="flex-1 truncate">{task.title}</span>
                {task.quality_score && <span className="text-yellow-400">★{task.quality_score.toFixed(1)}</span>}
              </div>
            ))}
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-400" /> Últimos Eventos</h2>
            {Array.isArray(logs) && logs.slice(0, 8).map(log => (
              <div key={log.id} className="py-2 border-b border-gray-800 text-sm">
                <span className="text-cyan-400 font-medium">{log.agent_name}</span>
                <span className="text-gray-500 mx-2">{log.action}</span>
                <p className="text-gray-400 text-xs truncate">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}