"use client";

import { useEffect, useRef, useState } from "react";
import type { DayEntry, SiteEntry, WorkRatio } from "@/lib/types";

interface Props {
  date: string;
  entry: DayEntry | null;
  onSave: (entry: DayEntry) => void;
  onDelete: () => void;
  onClose: () => void;
}

const WORK_RATIOS: WorkRatio[] = [0.5, 1];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function newSite(): SiteEntry {
  return { siteName: "", workRatio: 1, overtimeHours: 0 };
}

export default function ShiftModal({ date, entry, onSave, onDelete, onClose }: Props) {
  const [sites, setSites] = useState<SiteEntry[]>(
    entry && entry.sites.length > 0 ? entry.sites : [newSite()]
  );
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const updateSite = <K extends keyof SiteEntry>(
    idx: number,
    key: K,
    value: SiteEntry[K]
  ) => {
    setSites((prev) => prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s)));
  };

  const addSite = () => setSites((prev) => [...prev, newSite()]);
  const removeSite = (idx: number) =>
    setSites((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    const validSites = sites.filter((s) => s.siteName.trim() !== "");
    if (validSites.length === 0) return;
    onSave({ date, sites: validSites.map((s) => ({ ...s, siteName: s.siteName.trim() })) });
  };

  const canSave = sites.some((s) => s.siteName.trim() !== "");

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{formatDate(date)}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* 現場リスト（スクロール可） */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {sites.map((site, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 relative"
            >
              {/* 現場番号・削除ボタン */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  現場 {idx + 1}
                </span>
                {sites.length > 1 && (
                  <button
                    onClick={() => removeSite(idx)}
                    className="text-red-400 hover:text-red-600 text-sm font-medium"
                  >
                    削除
                  </button>
                )}
              </div>

              {/* 現場名 */}
              <input
                type="text"
                value={site.siteName}
                onChange={(e) => updateSite(idx, "siteName", e.target.value)}
                placeholder="現場名を入力"
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
              />

              {/* 出勤日数 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">出勤日数</label>
                <div className="grid grid-cols-2 gap-2">
                  {WORK_RATIOS.map((r) => (
                    <button
                      key={r}
                      onClick={() => updateSite(idx, "workRatio", r)}
                      className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
                        site.workRatio === r
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-blue-50"
                      }`}
                    >
                      {r === 0.5 ? "0.5日" : "1日"}
                    </button>
                  ))}
                </div>
              </div>

              {/* 残業（時間入力） */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">残業時間</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={site.overtimeHours === 0 ? "" : site.overtimeHours}
                    onChange={(e) =>
                      updateSite(idx, "overtimeHours", Number(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 w-full"
                  />
                  <span className="text-sm text-gray-400 shrink-0">時間</span>
                </div>
              </div>
            </div>
          ))}

          {/* 現場追加ボタン */}
          <button
            onClick={addSite}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-400 text-sm font-medium transition-colors"
          >
            ＋ 現場を追加
          </button>
        </div>

        {/* フッターボタン */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          {entry && (
            <button
              onClick={onDelete}
              className="flex-1 py-2 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors"
            >
              この日を削除
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 py-2.5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-40 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
