export type WorkRatio = 0.5 | 1;

export interface SiteEntry {
  siteName: string;
  workRatio: WorkRatio;
  overtimeHours: number; // 時間単位の自由入力
}

export interface DayEntry {
  date: string; // YYYY-MM-DD
  sites: SiteEntry[];
}

export type DayData = Record<string, DayEntry>;
export type GasolineData = Record<string, number>; // key: YYYY-MM → 金額
