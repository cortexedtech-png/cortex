"use client";

import {
  Heart,
  RefreshCcw,
  Terminal,
  Cpu,
  Trophy,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function TerminalHeader(props: {
  currentStage: number;
  maxStages: number;
  score: number;
  lives: number;
  integrity: number;
  isGameOver: boolean;
  isMissionClear: boolean;
  accent: "green" | "amber";
  accentClass: string;
  onToggleAccent: () => void;
  onRestart: () => void;
}) {
  const borderClass = "border border-[color:var(--terminal-border)]";
  const { theme, themeId } = useTheme();

  // ── Urban: clean modern light header ────────────────────────────────────
  if (themeId === 'urban') {
    return (
      <div className="flex flex-col border-b border-[#e2dfd8] bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-5 py-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-50">
              <Building2 className="h-5 w-5 text-[#e8473f]" />
            </div>
            <div className="flex flex-col">
              <div className="text-[15px] font-bold text-gray-900">Đô Thị Trọng Sinh</div>
              <div className="text-[11px] text-gray-400">{theme.ui.systemOnline}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-gray-100 text-[12px] text-gray-600 font-medium flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-gray-400" />
              {theme.ui.stageLabel} {props.currentStage}/{props.maxStages}
            </div>
            <div className="px-3 py-1.5 rounded-full bg-gray-100 text-[12px] text-gray-600 font-medium flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-gray-400" />
              {props.score} điểm
            </div>
            <div className="px-3 py-1.5 rounded-full bg-gray-100 text-[12px] text-gray-600 font-medium flex items-center gap-1.5">
              <Heart
                className={`h-3.5 w-3.5 ${props.lives > 1 ? 'text-[#e8473f]' : 'text-red-500 animate-pulse'}`}
                fill="currentColor"
                fillOpacity={0.3}
              />
              {props.lives} {theme.ui.livesLabel}
            </div>
            {props.isGameOver ? (
              <div className="px-3 py-1.5 rounded-full bg-red-50 text-[12px] text-red-600 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Nhiệm vụ thất bại
              </div>
            ) : null}
            {props.isMissionClear ? (
              <div className="px-3 py-1.5 rounded-full bg-green-50 text-[12px] text-green-600 font-semibold">
                Hoàn thành!
              </div>
            ) : null}
            <button
              type="button"
              onClick={props.onRestart}
              className="px-3 py-1.5 rounded-full border border-gray-200 text-[12px] text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all flex items-center gap-1.5"
            >
              <RefreshCcw className="h-3 w-3" />
              Thoát
            </button>
          </div>
        </div>

        {/* Danh vọng progress bar */}
        <div className="h-1 w-full bg-gray-100">
          <div
            className={`h-full transition-all duration-700 ${props.integrity > 40 ? 'bg-[#e8473f]' : 'bg-red-400 animate-pulse'}`}
            style={{ width: `${props.integrity}%` }}
          />
        </div>
      </div>
    );
  }

  // ── Synapse: terminal dark header ───────────────────────────────────────
  return (
    <div className="flex flex-col border-b border-[color:var(--terminal-border)] bg-[#0f0f0f]">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3 gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-2 border ${props.accent === 'green' ? 'border-[#3dff7a]/30' : 'border-[#ffb020]/30'} bg-black`}>
            <Terminal className={`h-5 w-5 ${props.accentClass}`} />
          </div>
          <div className="flex flex-col">
            <div className="text-[14px] font-black tracking-[0.3em] uppercase text-white flex items-center gap-2">
              SYNAPSE
              <span className={`text-[10px] px-1 border ${props.accentClass} opacity-50`}>v2.5</span>
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
              {theme.ui.systemOnline}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={props.onToggleAccent}
            className={`${borderClass} px-3 py-1 text-[10px] font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2`}
          >
            <div className={`w-2 h-2 rounded-full ${props.accent === 'green' ? 'bg-[#3dff7a]' : 'bg-[#ffb020]'} shadow-[0_0_8px_currentColor]`}></div>
            {props.accent === "green" ? "GREEN_MODE" : "AMBER_MODE"}
          </button>

          <div className={`${borderClass} px-3 py-1 text-[10px] font-bold text-white/70 flex items-center gap-2 bg-black/40`}>
            <Cpu className="h-3 w-3 opacity-50" />
            {theme.ui.stageLabel} {props.currentStage}/{props.maxStages}
          </div>

          <div className={`${borderClass} px-3 py-1 text-[10px] font-bold text-white/70 flex items-center gap-2 bg-black/40`}>
            <Trophy className="h-3 w-3 opacity-50" />
            {theme.ui.scoreLabel} {props.score}
          </div>

          <div className={`${borderClass} flex items-center gap-2 px-3 py-1 text-[10px] font-bold text-white/70 bg-black/40`}>
            <Heart className={`h-3 w-3 ${props.lives > 1 ? props.accentClass : 'text-[color:var(--terminal-danger)] animate-pulse'}`} fill="currentColor" fillOpacity={0.2} />
            {theme.ui.livesLabel} {props.lives}
          </div>

          {props.isGameOver ? (
            <div
              className={`${borderClass} px-3 py-1 text-[10px] font-black text-[color:var(--terminal-danger)] bg-red-500/10 border-red-500/50 flex items-center gap-2`}
            >
              <AlertTriangle className="h-3 w-3" />
              MISSION_FAILED
            </div>
          ) : null}

          {props.isMissionClear ? (
            <div
              className={`${borderClass} px-3 py-1 text-[10px] text-[#3dff7a] font-black animate-pulse bg-[#3dff7a]/10 border-[#3dff7a]/50 uppercase tracking-widest`}
            >
              MISSION_CLEAR
            </div>
          ) : null}

          <button
            type="button"
            onClick={props.onRestart}
            className={`${borderClass} flex items-center gap-2 px-3 py-1 text-[10px] font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all group`}
          >
            <RefreshCcw className="h-3 w-3 group-hover:rotate-180 transition-transform duration-500" />
            REBOOT_SYSTEM
          </button>
        </div>
      </div>

      {/* System Integrity Bar */}
      <div className="h-1.5 w-full bg-white/5 flex relative overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ease-out relative z-10 ${props.integrity > 40 ? (props.accent === 'green' ? 'bg-[#3dff7a]' : 'bg-[#ffb020]') : 'bg-red-500 animate-pulse'}`}
          style={{ width: `${props.integrity}%` }}
        />
        {/* Integrity bar — label changes by theme */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="text-[8px] font-bold tracking-[0.5em] text-white/20 uppercase">{theme.ui.integrityLabel}_Matrix</div>
        </div>
      </div>
    </div>
  );
}
