import { DEFAULT_SETTINGS, ACTIONS } from './constants.js';

let currentSpeech = {
  text: '',
  charIndex: 0,
  isSpeaking: false
};

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS));
  
  const defaults = {};
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    if (existing[key] === undefined) {
      defaults[key] = value;
    }
  }
  
  if (Object.keys(defaults).length > 0) {
    await chrome.storage.sync.set(defaults);
  }
});

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === 'sync') {
    if (changes.enabled && changes.enabled.newValue === false) {
      chrome.tts.stop();
      currentSpeech.isSpeaking = false;
      return;
    }
    
    if (currentSpeech.isSpeaking && (changes.rate || changes.volume)) {
      const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
      const remainingText = currentSpeech.text.substring(currentSpeech.charIndex);
      
      if (remainingText.length > 0) {
        chrome.tts.stop();
        speakText(remainingText, settings.rate, settings.volume, false);
      }
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === ACTIONS.SPEAK) {
    speakText(message.text, message.rate, message.volume, true);
  } else if (message.action === ACTIONS.STOP) {
    chrome.tts.stop();
    currentSpeech.isSpeaking = false;
  }
  return true;
});

function speakText(text, rate, volume, isNewSpeech = true) {
  chrome.tts.stop();
  
  if (isNewSpeech) {
    currentSpeech.text = text;
    currentSpeech.charIndex = 0;
  }
  
  currentSpeech.isSpeaking = true;
  
  chrome.tts.speak(text, {
    rate: rate,
    volume: volume,
    lang: 'ja-JP',
    onEvent: (event) => {
      if (event.type === 'word' && event.charIndex !== undefined) {
        if (isNewSpeech) {
          currentSpeech.charIndex = event.charIndex;
        } else {
          currentSpeech.charIndex = currentSpeech.text.length - text.length + event.charIndex;
        }
      } else if (event.type === 'end' || event.type === 'cancelled') {
        currentSpeech.isSpeaking = false;
      } else if (event.type === 'error') {
        currentSpeech.isSpeaking = false;
        console.error('TTS Error:', event.errorMessage);
      }
    }
  });
}
