// logic/storage.js
// ---------------------------------------------------------------------------
// All AsyncStorage interactions live here. A single keys map keeps usage
// consistent and makes it trivial to refactor or namespace later. Every
// helper falls back gracefully on parse errors so a corrupted key cannot
// brick the app.
// ---------------------------------------------------------------------------

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_PEOPLE, DEFAULT_EXPENSES } from '../data/initialData';

const KEYS = {
  AUTH:     '@splitmate/auth',
  PEOPLE:   '@splitmate/people',
  EXPENSES: '@splitmate/expenses',
  PREFS:    '@splitmate/prefs',
  SEEDED:   '@splitmate/seeded',
};

async function getJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[storage] getJSON failed for', key, err);
    return fallback;
  }
}

async function setJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('[storage] setJSON failed for', key, err);
  }
}

// ---- auth ---------------------------------------------------------------
export const loadAuthUser  = ()    => getJSON(KEYS.AUTH, null);
export const saveAuthUser  = (u)   => setJSON(KEYS.AUTH, u);
export const clearAuthUser = ()    => AsyncStorage.removeItem(KEYS.AUTH);

// ---- people -------------------------------------------------------------
export const loadPeople = () => getJSON(KEYS.PEOPLE, DEFAULT_PEOPLE);
export const savePeople = (p) => setJSON(KEYS.PEOPLE, p);

// ---- expenses -----------------------------------------------------------
export const loadExpenses = () => getJSON(KEYS.EXPENSES, DEFAULT_EXPENSES);
export const saveExpenses = (e) => setJSON(KEYS.EXPENSES, e);

// ---- prefs --------------------------------------------------------------
const DEFAULT_PREFS = {
  sortBy:         'date',   // 'date' | 'amount' | 'title'
  sortDir:        'desc',   // 'asc'  | 'desc'
  filterCategory: 'All',
  pageSize:       6,
};
export const loadPrefs = () => getJSON(KEYS.PREFS, DEFAULT_PREFS);
export const savePrefs = (p) => setJSON(KEYS.PREFS, p);

// ---- one-shot seed ------------------------------------------------------
// On the very first launch we write the seed data through. After that the
// flag prevents re-seeding so the user's edits survive across reloads.
export async function seedIfNeeded() {
  const seeded = await getJSON(KEYS.SEEDED, false);
  if (!seeded) {
    await setJSON(KEYS.PEOPLE,   DEFAULT_PEOPLE);
    await setJSON(KEYS.EXPENSES, DEFAULT_EXPENSES);
    await setJSON(KEYS.SEEDED,   true);
  }
}

// Wipe everything (used by Settings -> "Reset demo data" button).
export async function resetAllData() {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch (err) {
    console.warn('[storage] resetAllData failed', err);
  }
}
