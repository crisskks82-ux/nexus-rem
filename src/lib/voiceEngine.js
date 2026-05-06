export function createSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'es-ES';
  return recognition;
}

export function speak(text, onEnd = null) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const cleanText = text.replace(/\*[^*]*\*/g, '').replace(/`[^`]*`/g, '').trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.pitch = 1.4;
  utterance.rate = 0.95;
  utterance.volume = 0.9;
  const voices = window.speechSynthesis.getVoices();
  const femaleVoice = voices.find(v => v.lang.startsWith('es')) || voices[0];
  if (femaleVoice) utterance.voice = femaleVoice;
  utterance.lang = 'es-ES';
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

export function loadVoices() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis?.getVoices();
    if (voices?.length) resolve(voices);
    else window.speechSynthesis?.addEventListener('voiceschanged', () => resolve(window.speechSynthesis.getVoices()), { once: true });
  });
}