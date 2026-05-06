import { base44 } from '@/api/base44Client';

const DEFAULT_PARAMS = { duration: 4, quality_target: 7.0, prompt_style: 'cinematic, high quality, 4K', aspect_ratio: '16:9', success_streak: 0, total_renders: 0, avg_quality: 0, best_prompt_modifiers: ['cinematic'], failed_modifiers: [] };

function loadParams() {
  try {
    const saved = localStorage.getItem('nexus_video_params');
    return saved ? { ...DEFAULT_PARAMS, ...JSON.parse(saved) } : { ...DEFAULT_PARAMS };
  } catch { return { ...DEFAULT_PARAMS }; }
}

function saveParams(params) {
  try { localStorage.setItem('nexus_video_params', JSON.stringify(params)); } catch {}
}

export function getVideoParams() { return loadParams(); }

export async function enhanceVideoPrompt(userPrompt, params) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Mejora este prompt de video: "${userPrompt}". Modificadores: ${params.best_prompt_modifiers.join(', ')}. Responde JSON: { "enhanced_prompt": "string" }`,
    response_json_schema: { type: 'object', properties: { enhanced_prompt: { type: 'string' } } }
  });
  return result;
}

export async function generateVideoSegment(prompt, params, segmentIndex = 0) {
  const result = await base44.integrations.Core.GenerateVideo({ prompt, duration: params.duration, aspect_ratio: params.aspect_ratio });
  return { url: result.url, duration: params.duration, elapsed_ms: 0, segment_index: segmentIndex };
}

export async function evaluateVideoSegment(videoUrl, prompt, elapsed_ms, params) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Evalúa este video: ${videoUrl}. Prompt: "${prompt}". Responde JSON con scores de 0-10.`,
    response_json_schema: { type: 'object', properties: { visual_quality: { type: 'number' }, overall_score: { type: 'number' }, approved: { type: 'boolean' }, rem_evaluation: { type: 'string' } } }
  });
  return result;
}

export function applyReinforcementLearning(params, evaluation, success) {
  const updated = { ...params };
  updated.total_renders += 1;
  if (success && evaluation.overall_score >= params.quality_target) {
    updated.success_streak += 1;
    updated.avg_quality = ((updated.avg_quality * (updated.total_renders - 1)) + evaluation.overall_score) / updated.total_renders;
  } else {
    updated.success_streak = 0;
  }
  saveParams(updated);
  return updated;
}

export async function runVideoGenerationPipeline(userPrompt, onProgress = null) {
  let params = loadParams();
  try {
    if (onProgress) onProgress('enhancing', 'Rem mejora el prompt...');
    const enhanced = await enhanceVideoPrompt(userPrompt, params);
    
    if (onProgress) onProgress('generating', 'Generando vídeo...');
    const segment = await generateVideoSegment(enhanced.enhanced_prompt, params, 0);
    
    if (onProgress) onProgress('evaluating', 'Evaluando calidad...');
    const evaluation = await evaluateVideoSegment(segment.url, enhanced.enhanced_prompt, segment.elapsed_ms, params);
    
    const updatedParams = applyReinforcementLearning(params, evaluation, evaluation.approved);
    
    await base44.entities.Task.create({ title: userPrompt.substring(0, 80), type: 'video', status: 'completed', input_prompt: userPrompt, output: segment.url, quality_score: evaluation.overall_score, supervisor_feedback: evaluation.rem_evaluation });
    
    return { success: true, video_url: segment.url, all_segments: [segment], evaluation, enhanced_prompt: enhanced, params_used: updatedParams, params_before: params };
  } catch (error) {
    throw error;
  }
}