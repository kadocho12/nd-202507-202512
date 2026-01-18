export const DEFAULT_SETTINGS = {
  enabled: false,
  rate: 1.0,
  volume: 1.0
};

export const RATE_RANGE = {
  min: 0.5,
  max: 3.0,
  step: 0.1
};

export const VOLUME_RANGE = {
  min: 0,
  max: 1.0,
  step: 0.1
};

export const EVENT_DELAY_MS = 10;

export const ACTIONS = {
  SPEAK: 'speak',
  STOP: 'stop',
  UPDATE_SETTINGS: 'updateSettings'
};
