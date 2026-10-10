// Helper for Text-to-Speech using Gemini 3.8 Flash Lite TTS with SpeechSynthesis fallback
let activeAudioElement: HTMLAudioElement | null = null;

export async function playTextToSpeech(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<() => void> {
  // Stop any currently playing audio
  stopCurrentAudio();

  let cancelled = false;
  onStart?.();

  const stopFn = () => {
    cancelled = true;
    stopCurrentAudio();
    onEnd?.();
  };

  try {
    // 1. Try server-side Gemini 3.8 Flash TTS
    const response = await fetch('/api/audio/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (response.ok && !cancelled) {
      const data = await response.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        activeAudioElement = audio;

        audio.onended = () => {
          activeAudioElement = null;
          onEnd?.();
        };
        audio.onerror = () => {
          // Fallback to browser SpeechSynthesis
          playBrowserSpeechSynthesis(text, onEnd);
        };

        await audio.play();
        return stopFn;
      }
    }
  } catch (err) {
    console.warn('Gemini TTS failed, falling back to browser speech synthesis:', err);
  }

  // 2. Fallback to Browser window.speechSynthesis
  if (!cancelled) {
    playBrowserSpeechSynthesis(text, onEnd);
  }

  return stopFn;
}

function playBrowserSpeechSynthesis(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'tr-TR';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Try finding Turkish voice
  const voices = window.speechSynthesis.getVoices();
  const trVoice = voices.find((v) => v.lang.startsWith('tr'));
  if (trVoice) {
    utterance.voice = trVoice;
  }

  utterance.onend = () => {
    onEnd?.();
  };
  utterance.onerror = () => {
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopCurrentAudio() {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {}
    activeAudioElement = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

// Convert audio blob to Base64
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // strip "data:...;base64," prefix
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
