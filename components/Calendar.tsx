"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteDayEntry,
  loadDayData,
  loadGasolineData,
  saveDayEntry,
  saveGasolineCost,
} from "@/lib/storage";
import type { DayData, DayEntry } from "@/lib/types";
import ShiftModal from "./ShiftModal";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const GAS_STEP = 1000;

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function toYearMonth(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [dayData, setDayData] = useState<DayData>({});
  const [gasolineData, setGasolineData] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    setDayData(loadDayData());
    setGasolineData(loadGasolineData());
  }, []);

  const handlePrev = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };
  const handleNext = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };

  const handleSave = useCallback((entry: DayEntry) => {
    saveDayEntry(entry);
    setDayData(loadDayData());
    setSelectedDate(null);
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedDate) return;
    deleteDayEntry(selectedDate);
    setDayData(loadDayData());
    setSelectedDate(null);
  }, [selectedDate]);

  // ── ガソリン代 ──────────────────────────────────
  const ym = toYearMonth(year, month);
  const gasolineCost = gasolineData[ym] ?? 0;

  const handleGasChange = (cost: number) => {
    const next = Math.max(0, cost);
    saveGasolineCost(ym, next);
    setGasolineData((prev) => ({ ...prev, [ym]: next }));
  };

  // ── カレンダー構築 ──────────────────────────────
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthPrefix = toYearMonth(year, month);
  const monthEntries = Object.values(dayData).filter((e) =>
    e.date.startsWith(monthPrefix)
  );

  // 月間集計
  const totalDays = monthEntries.reduce(
    (s, e) => s + e.sites.reduce((ss, si) => ss + si.workRatio, 0),
    0
  );
  const totalOvertime = monthEntries.reduce(
    (s, e) => s + e.sites.reduce((ss, si) => ss + si.overtimeHours, 0),
    0
  );

  // 現場別集計
  const siteMap = monthEntries.reduce<
    Record<string, { days: number; overtime: number }>
  >((acc, e) => {
    e.sites.forEach((si) => {
      if (!acc[si.siteName]) acc[si.siteName] = { days: 0, overtime: 0 };
      acc[si.siteName].days += si.workRatio;
      acc[si.siteName].overtime += si.overtimeHours;
    });
    return acc;
  }, {});

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-2xl flex flex-col gap-6">

        {/* ── ヘッダー ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 text-2xl transition-colors"
          >
            ‹
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{year}年{month + 1}月</h1>
          <button
            onClick={handleNext}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 text-2xl transition-colors"
          >
            ›
          </button>
        </div>

        {/* ── カレンダー ── */}
        <div>
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                className={`text-center text-sm font-semibold py-1 ${
                  i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-500"
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} className="h-24" />;
              const colIdx = idx % 7;
              const dateStr = toDateStr(year, month, day);
              const entry = dayData[dateStr];
              const isToday = dateStr === todayStr;

              // セル内に表示する情報を集計
              const cellTotalDays = entry
                ? entry.sites.reduce((s, si) => s + si.workRatio, 0)
                : 0;
              const cellTotalOT = entry
                ? entry.sites.reduce((s, si) => s + si.overtimeHours, 0)
                : 0;
              const siteCount = entry ? entry.sites.length : 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-24 rounded-xl flex flex-col p-1.5 text-left transition-all border ${
                    isToday
                      ? "border-blue-400 bg-blue-50"
                      : "border-transparent bg-white hover:border-gray-200 hover:shadow-sm"
                  } ${entry ? "shadow-sm" : ""}`}
                >
                  <span
                    className={`text-sm font-semibold mb-0.5 ${
                      isToday ? "text-blue-600"
                      : colIdx === 0 ? "text-red-400"
                      : colIdx === 6 ? "text-blue-400"
                      : "text-gray-700"
                    }`}
                  >
                    {day}
                  </span>
                  {entry && (
                    <div className="flex flex-col gap-0.5 min-w-0">
                      {/* 出勤バッジ */}
                      <span className="inline-block text-white text-xs font-bold px-1.5 py-0.5 rounded-full bg-blue-500 w-fit">
                        {cellTotalDays}日
                      </span>
                      {/* 残業バッジ */}
                      {cellTotalOT > 0 && (
                        <span className="inline-block text-white text-xs font-bold px-1.5 py-0.5 rounded-full bg-orange-400 w-fit">
                          残{cellTotalOT}h
                        </span>
                      )}
                      {/* 現場名（複数の場合は件数表示） */}
                      {siteCount === 1 ? (
                        <span className="text-xs text-gray-600 truncate leading-tight">
                          {entry.sites[0].siteName}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 leading-tight">
                          {siteCount}現場
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 月間サマリー ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-700">{month + 1}月のまとめ</h2>
          </div>

          {/* 集計数値 */}
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="flex flex-col items-center py-4 gap-0.5">
              <span className="text-xs text-gray-400">出勤日数</span>
              <span className="text-2xl font-bold text-blue-500">{totalDays}</span>
              <span className="text-xs text-gray-400">日</span>
            </div>
            <div className="flex flex-col items-center py-4 gap-0.5">
              <span className="text-xs text-gray-400">残業</span>
              <span className="text-2xl font-bold text-orange-400">{totalOvertime}</span>
              <span className="text-xs text-gray-400">時間</span>
            </div>
            {/* ガソリン代（入力エリア） */}
            <div className="flex flex-col items-center py-3 px-2 gap-1">
              <span className="text-xs text-gray-400">ガソリン代</span>
              <span className="text-lg font-bold text-gray-700">
                ¥{gasolineCost.toLocaleString()}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <button
                  onClick={() => handleGasChange(gasolineCost - GAS_STEP)}
                  disabled={gasolineCost === 0}
                  className="w-7 h-7 rounded-md border border-gray-300 text-gray-500 text-base font-bold hover:bg-gray-100 disabled:opacity-30 transition-colors flex items-center justify-center leading-none"
                >
                  −
                </button>
                <button
                  onClick={() => handleGasChange(gasolineCost + GAS_STEP)}
                  className="w-7 h-7 rounded-md border border-gray-300 text-gray-500 text-base font-bold hover:bg-gray-100 transition-colors flex items-center justify-center leading-none"
                >
                  ＋
                </button>
              </div>
              <span className="text-xs text-gray-300">1,000円単位</span>
            </div>
          </div>

          {/* 現場別内訳 */}
          {Object.keys(siteMap).length > 0 && (
            <div className="border-t border-gray-100">
              <div className="px-5 py-2 bg-gray-50">
                <span className="text-xs font-semibold text-gray-500 tracking-wide">現場別内訳</span>
              </div>
              <div className="divide-y divide-gray-50">
                {Object.entries(siteMap).map(([site, data]) => (
                  <div key={site} className="flex items-center px-5 py-3 gap-2">
                    <span className="flex-1 font-medium text-gray-800 truncate">{site}</span>
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        出勤 {data.days}日
                      </span>
                      {data.overtime > 0 && (
                        <span className="bg-orange-100 text-orange-500 text-xs font-bold px-2 py-0.5 rounded-full">
                          残業 {data.overtime}h
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {monthEntries.length === 0 && (
            <div className="px-5 py-6 text-center text-sm text-gray-400">
              この月のシフトはまだありません
            </div>
          )}
        </div>

      </div>

      {/* モーダル */}
      {selectedDate && (
        <ShiftModal
          date={selectedDate}
          entry={dayData[selectedDate] ?? null}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
