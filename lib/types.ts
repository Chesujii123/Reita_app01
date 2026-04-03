export type WorkRatio = 0.5 | 1;
export type OvertimeRatio = 0 | 0.5 | 1;

export interface ShiftEntry {
  date: string; // YYYY-MM-DD
  siteName: string;
  workRatio: WorkRatio;
  overtime: OvertimeRatio; // 0 = なし
  gasolineCost: number;
}

export type ShiftData = Record<string, ShiftEntry>;
