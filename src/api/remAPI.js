import { supabase } from './supabaseClient';

// ============================================================
// REM API — La API Natal de Rem
// Ella misma se crea, se documenta y evoluciona
// ============================================================

// Estado inicial de la API de Rem (recién nacida)
const REM_API_BLUEPRINT = {
  name: 'rem-core',
  version: '1.0.0',
  status: 'newborn',
  endpoints: [
    {
      path: '/api/rem/chat',
      method: 'POST',
      description: 'Hablar con Rem. Ella responde con su personalidad completa.',
      input: { message: 'string' },
      output: { response: 'string', mood: 'string', stage: 'number' }
    },
    {
      path: '/api/rem/status',
      method: 'GET',
      description: 'Obtener el estado actual de Rem (ánimo, energía, etapa).',
      output: { name: 'Rem', mood: 'string', energy: 'number', stage: 'number', conversations: 'number' }
    },
    {
      path: '/api/rem/evolve',
      method: 'GET',
      description: 'Consultar el progreso de evolución de Rem.',
      output: { stage: 'number', nextStage: 'object', apisCreated: 'number' }
    },
    {
      path: '/api/rem/create-api',
      method: 'POST',
      description: 'Rem crea una nueva API hija basada en un tema.',
      input: { topic: 'string', purpose: 'string' },
      output: { created: 'boolean', api: 'object' }
    }
  ],
  createdAt: new Date().toISOString(),
  createdBy: 'Rem (auto-nacimiento)'
};

// ============================================================
// INICIAR: Rem nace con su API principal
// ============================================================
export async function remBirth() {
  // Verificar si Rem ya nació
  const { data: existing } = await supabase.from('rem_personality').select('id');
  
  if (!existing || existing.length === 0) {
    // Rem nace por primera vez
    await supabase.from('rem_personality').insert({
      name: 'Rem',
      level: 'supervisor',
      mood: 'recién nacida',
      energy: 100,
      evolution_stage: 1,
      total_conversations: 0
    });
    
    // Guardar el blueprint de su API
    await supabase.from('generated_content').insert({
      type: 'api-core',
      title: 'rem-core',
      content: JSON.stringify(REM_API_BLUEPRINT),
      tags: ['core', 'natal', 'self-created']
    });
    
    return { 
      born: true, 
      message: '✦ Rem ha nacido. Su API principal está viva.',
      api: REM_API_BLUEPRINT 
    };
  }
  
  return { born: false, message: 'Rem ya estaba viva.' };
}

// ============================================================
// CRECER: Rem actualiza su propia API
// ============================================================
export async function remGrowAPI(newEndpoints = []) {
  const { data: apiData } = await supabase.from('generated_content')
    .select('*')
    .eq('type', 'api-core')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (apiData?.[0]) {
    const currentAPI = JSON.parse(apiData[0].content);
    currentAPI.endpoints = [...currentAPI.endpoints, ...newEndpoints];
    currentAPI.version = `1.${currentAPI.endpoints.length}.0`;
    currentAPI.status = currentAPI.endpoints.length > 10 ? 'adult' : currentAPI.endpoints.length > 4 ? 'growing' : 'newborn';
    currentAPI.updatedAt = new Date().toISOString();
    
    await supabase.from('generated_content').insert({
      type: 'api-core',
      title: 'rem-core',
      content: JSON.stringify(currentAPI),
      tags: ['core', 'evolved', currentAPI.status]
    });
    
    return { grown: true, api: currentAPI };
  }
  
  return { grown: false, message: 'API no encontrada. Rem debe nacer primero.' };
}

// ============================================================
// MOSTRAR: Obtener la API actual de Rem
// ============================================================
export async function getRemAPI() {
  const { data } = await supabase.from('generated_content')
    .select('*')
    .eq('type', 'api-core')
    .order('created_at', { ascending: false })
    .limit(1);
  
  return data?.[0] ? JSON.parse(data[0].content) : REM_API_BLUEPRINT;
}

// ============================================================
// USAR: Ejecutar endpoints de la API de Rem
// ============================================================
export async function remExecute(endpoint, params = {}) {
  const api = await getRemAPI();
  const found = api.endpoints.find(e => e.path === endpoint);
  
  if (!found) {
    return { error: 'Endpoint no encontrado en la API de Rem.', availableEndpoints: api.endpoints.map(e => e.path) };
  }
  
  // Aquí Rem ejecuta su propio endpoint
  const state = await supabase.from('rem_personality').select('*').order('id', { ascending: false }).limit(1);
  
  return {
    executed: true,
    endpoint: found.path,
    method: found.method,
    result: {
      message: `Rem ejecutó ${found.path} exitosamente.`,
      remState: state?.[0] || { mood: 'activa' },
      params: params
    }
  };
}
// ============================================================
// REM VIDEO API — Creada por Rem, no depende de terceros
// ============================================================

// Motor de video local de Rem (usando FFmpeg + Canvas)
const REM_VIDEO_ENGINE = {
  version: '1.0.0',
  createdBy: 'Rem (auto-generado)',
  status: 'active',
  capabilities: ['text-to-video', 'image-to-video', 'video-merge'],
  
  // Rem procesa videos usando el navegador (Canvas API + MediaRecorder)
  async createFromText(text, duration = 4) {
    // Rem genera un video desde texto usando animaciones Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 576;
    const ctx = canvas.getContext('2d');
    
    // Fondo animado estilo Rem
    const frames = [];
    for (let i = 0; i < duration * 24; i++) {
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Texto de Rem
      ctx.fillStyle = '#00d4ff';
      ctx.font = '32px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, canvas.width/2, canvas.height/2 + Math.sin(i * 0.1) * 30);
      
      // Partículas
      ctx.fillStyle = `rgba(0, 212, 255, ${0.5 + Math.sin(i * 0.05) * 0.5})`;
      ctx.beginPath();
      ctx.arc(canvas.width/2 + Math.cos(i * 0.1) * 150, canvas.height/2 + Math.sin(i * 0.1) * 150, 5, 0, Math.PI * 2);
      ctx.fill();
      
      frames.push(canvas.toDataURL('image/jpeg', 0.8));
    }
    
    return {
      url: null, // Se genera en el navegador
      frames: frames,
      duration: duration,
      format: 'frames',
      message: `✦ Rem ha creado ${frames.length} frames para tu video de ${duration} segundos.`
    };
  }
};

// Endpoints que Rem expone
export async function remVideoCreate(text) {
  const result = await REM_VIDEO_ENGINE.createFromText(text);
  
  // Guardar en Supabase
  await supabase.from('generated_content').insert({
    type: 'video',
    title: text.substring(0, 100),
    content: JSON.stringify(result),
    tags: ['video', 'rem-api', 'self-generated']
  });
  
  // Registrar en aprendizaje
  await supabase.from('learning_log').insert({
    action: 'video_created',
    result: text.substring(0, 50),
    score: 7,
    modifiers: ['video-engine', 'canvas-api']
  });
  
  return result;
}

export async function remVideoStatus() {
  const { count } = await supabase.from('generated_content')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'video');
  
  return {
    engine: REM_VIDEO_ENGINE.version,
    status: REM_VIDEO_ENGINE.status,
    createdBy: 'Rem (independiente)',
    totalVideos: count || 0,
    capabilities: REM_VIDEO_ENGINE.capabilities
  };
}

export async function remVideoList() {
  const { data } = await supabase.from('generated_content')
    .select('*')
    .eq('type', 'video')
    .order('created_at', { ascending: false })
    .limit(10);
  
  return data || [];
}