"use client";

import { useEffect, useRef, useState } from "react";
import type { OvertimeRatio, ShiftEntry, WorkRatio } from "@/lib/types";

interface Props {
  date: string;
  entry: ShiftEntry | null;
  onSave: (entry: ShiftEntry) => void;
  onDelete: () => void;
  onClose: () => void;
}

const WORK_RATIOS: WorkRatio[] = [0.5, 1];
const WORK_RATIO_LABELS: Record<number, string> = {
  0.5: "0.5日",
  1: "1日",
};

const OVERTIME_OPTIONS: { value: OvertimeRatio; label: string }[] = [
  { value: 0, label: "なし" },
  { value: 0.5, label: "0.5日" },
  { value: 1, label: "1日" },
];

const GAS_STEP = 1000;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function ShiftModal({ date, entry, onSave, onDelete, onClose }: Props) {
  const [siteName, setSiteName] = useState(entry?.siteName ?? "");
  const [workRatio, setWorkRatio] = useState<WorkRatio>(entry?.workRatio ?? 1);
  const [overtime, setOvertime] = useState<OvertimeRatio>(entry?.overtime ?? 0);
  const [gasolineCost, setGasolineCost] = useState(entry?.gasolineCost ?? 0);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSave = () => {
    if (!siteName.trim()) return;
    onSave({
      date,
      siteName: siteName.trim(),
      workRatio,
      overtime,
      gasolineCost,
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const decreaseGas = () => setGasolineCost((v) => Math.max(0, v - GAS_STEP));
  const increaseGas = () => setGasolineCost((v) => v + GAS_STEP);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">
        {/* タイトル */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">{formatDate(date)}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* 現場名 */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-600">現場名</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="現場名を入力"
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* 出勤日数 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">出勤日数</label>
          <div className="grid grid-cols-2 gap-2">
            {WORK_RATIOS.map((r) => (
              <button
                key={r}
                onClick={() => setWorkRatio(r)}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                  workRatio === r
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-blue-50"
                }`}
              >
                {WORK_RATIO_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        {/* 残業 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">残業</label>
          <div className="grid grid-cols-3 gap-2">
            {OVERTIME_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setOvertime(value)}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                  overtime === value
                    ? "bg-orange-400 text-white border-orange-400"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-orange-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ガソリン代 */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-600">ガソリン代</label>
          <div className="flex items-center gap-2">
            <button
              onClick={decreaseGas}
              disabled={gasolineCost === 0}
              className="w-10 h-10 rounded-lg border border-gray-300 text-gray-600 text-xl font-bold hover:bg-gray-100 disabled:opacity-30 transition-colors flex items-center justify-center"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-xl font-bold text-gray-800">
                ¥{gasolineCost.toLocaleString()}
              </span>
            </div>
            <button
              onClick={increaseGas}
              className="w-10 h-10 rounded-lg border border-gray-300 text-gray-600 text-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              ＋
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center">1,000円単位で増減</p>
        </div>

        {/* ボタン */}
        <div className="flex gap-3 pt-1">
          {entry && (
            <button
              onClick={onDelete}
              className="flex-1 py-2 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors"
            >
              削除
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!siteName.trim()}
            className="flex-1 py-2.5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-40 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
