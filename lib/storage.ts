import type { ShiftData, ShiftEntry } from "./types";

const STORAGE_KEY = "shift_data";

export function loadShiftData(): ShiftData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ShiftData) : {};
  } catch {
    return {};
  }
}

export function saveShiftEntry(entry: ShiftEntry): void {
  const data = loadShiftData();
  data[entry.date] = entry;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function deleteShiftEntry(date: string): void {
  const data = loadShiftData();
  delete data[date];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
