import { config } from '../config';

/** Returns null (not a fallback mock ID) when using real API, to avoid crashing the backend */
export const getCurrentEventId = () => {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem('munar_current_event_id');
  if (!stored) return null;
  // If real API mode: reject mock IDs like 'evt-1' (not UUIDs)
  if (!config.features.useMockData) {
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(stored)) {
      window.localStorage.removeItem('munar_current_event_id');
      return null;
    }
  }
  return stored;
};

export const setCurrentEventId = (eventId: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('munar_current_event_id', eventId);
};

type EventPayloadStore = Record<string, Record<string, unknown>>;

const STORAGE_KEY = 'munar_event_payloads';

const loadStore = (): EventPayloadStore => {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as EventPayloadStore;
  } catch {
    return {};
  }
};

const saveStore = (store: EventPayloadStore) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const getEventPayload = <T>(eventId: string, key: string, fallback: T): T => {
  const store = loadStore();
  const eventData = store[eventId] || {};
  return (eventData[key] as T) ?? fallback;
};

export const setEventPayload = <T>(eventId: string, key: string, value: T) => {
  const store = loadStore();
  const eventData = store[eventId] || {};
  store[eventId] = { ...eventData, [key]: value };
  saveStore(store);
};
