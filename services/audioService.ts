
let voices: SpeechSynthesisVoice[] = [];

const loadVoices = () => {
  // getVoices() returns all available voices
  voices = window.speechSynthesis.getVoices();
};

// Initialize voices
loadVoices();

// Chrome loads voices asynchronously
if (typeof window !== 'undefined' && window.speechSynthesis) {
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
}

export const playText = (text: string, lang: 'en' | 'zh' = 'en', onEnd?: () => void) => {
  // Cancel any currently playing audio to avoid overlap
  window.speechSynthesis.cancel();
  
  // Retry loading voices if empty (sometimes needed on first interaction)
  if (voices.length === 0) {
      loadVoices();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  if (lang === 'en') {
      // Strategy for "Normal American Broadcast":
      // 1. Look for "Google US English" (Standard high quality on Chrome/Android)
      // 2. Look for "Samantha" (Standard on macOS/iOS)
      // 3. Look for any 'en-US' voice
      const targetLang = 'en-US';
      
      const preferredVoice = 
        voices.find(v => v.name === 'Google US English') ||
        voices.find(v => v.name === 'Samantha') ||
        voices.find(v => v.lang === targetLang && v.name.includes('Google')) ||
        voices.find(v => v.lang === targetLang);

      if (preferredVoice) {
          utterance.voice = preferredVoice;
      }
      
      utterance.lang = targetLang;
      utterance.rate = 1.0; // Normal speed (Broadcast standard)
      utterance.pitch = 1.0; // Normal pitch
  } else {
      // Strategy for Chinese
      const targetLang = 'zh-CN';
      // Prioritize Google Chinese or standard system voice
      const preferredVoice = 
        voices.find(v => v.name === 'Google 普通话（中国大陆）') ||
        voices.find(v => v.lang === targetLang);

       if (preferredVoice) {
          utterance.voice = preferredVoice;
      }
      utterance.lang = targetLang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.error("Speech synthesis error", e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
};

export const stopAudio = () => {
  window.speechSynthesis.cancel();
};
