import type { DayData, DayEntry, GasolineData } from "./types";

const DAY_KEY = "shift_day_data";
const GAS_KEY = "shift_gas_data";

// ── 日別シフトデータ ──────────────────────────────

export function loadDayData(): DayData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DAY_KEY);
    return raw ? (JSON.parse(raw) as DayData) : {};
  } catch {
    return {};
  }
}

export function saveDayEntry(entry: DayEntry): void {
  const data = loadDayData();
  data[entry.date] = entry;
  localStorage.setItem(DAY_KEY, JSON.stringify(data));
}

export function deleteDayEntry(date: string): void {
  const data = loadDayData();
  delete data[date];
  localStorage.setItem(DAY_KEY, JSON.stringify(data));
}

// ── 月別ガソリン代データ ──────────────────────────

export function loadGasolineData(): GasolineData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(GAS_KEY);
    return raw ? (JSON.parse(raw) as GasolineData) : {};
  } catch {
    return {};
  }
}

export function saveGasolineCost(yearMonth: string, cost: number): void {
  const data = loadGasolineData();
  data[yearMonth] = cost;
  localStorage.setItem(GAS_KEY, JSON.stringify(data));
}
