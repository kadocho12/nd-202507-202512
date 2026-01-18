// 定数（Content ScriptsはES Modulesをサポートしていないためローカル定義）
const DEFAULT_SETTINGS = {
  enabled: false,
  rate: 1.0,
  volume: 1.0
};
const EVENT_DELAY_MS = 10;
const ACTIONS = {
  SPEAK: 'speak',
  STOP: 'stop'
};

let currentSettings = { ...DEFAULT_SETTINGS };

function sendMessageSafely(message) {
  chrome.runtime.sendMessage(message);
}

async function loadSettings() {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  currentSettings = settings;
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'sync') return;
  const next = { ...currentSettings };
  for (const [key, change] of Object.entries(changes)) {
    next[key] = change.newValue;
  }
  currentSettings = next;
});

loadSettings();

document.addEventListener('mouseup', async (event) => {
  setTimeout(async () => {
    const selection = window.getSelection();    
    const selectedText = selection.toString().trim();
    
    const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    currentSettings = settings;
    
    if (!settings.enabled) {
      return;
    }

    sendMessageSafely({
      action: ACTIONS.SPEAK,
      text: selectedText,
      rate: settings.rate,
      volume: settings.volume
    });
  }, EVENT_DELAY_MS);
});

document.addEventListener('selectionchange', async () => {
  setTimeout(async () => {
    const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    currentSettings = settings;
    if (!settings.enabled) {
      return;
    }

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (!selectedText || selectedText.length === 0) {
      sendMessageSafely({ action: ACTIONS.STOP });
    }
  }, EVENT_DELAY_MS);
});
