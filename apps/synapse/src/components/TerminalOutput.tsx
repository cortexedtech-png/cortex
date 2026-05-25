"use client";

import {
  CircleDashed,
  Info,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { useEffect, useRef } from "react";
import type { SynapseChoice, SynapseScenario } from "../lib/synapseTypes";
import { useTheme } from "../context/ThemeContext";

export type TerminalMode = "idle" | "loading" | "narrative" | "outcome";

export function TerminalOutput(props: {
  mode: TerminalMode;
  accentClass: string;
  borderClass: string;
  scenario: SynapseScenario | null;
  selected: SynapseChoice | null;
  narrativeText: string;
  narrativeTyped: string;
  narrativeDone: boolean;
  outcomeText: string;
  outcomeTyped: string;
  outcomeDone: boolean;
  error: string | null;
  onStart: () => void;
  pastStages?: Array<{ scenario: SynapseScenario; selected: SynapseChoice }>;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { theme, themeId } = useTheme();
  const textClass = themeId === 'urban' ? 'text-gray-800' : 'text-white/85';
  const mutedClass = themeId === 'urban' ? 'text-gray-500' : 'text-white/70';
  const dimClass = themeId === 'urban' ? 'text-gray-400' : 'text-white/40';

  useEffect(() => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [
    props.mode,
    props.narrativeTyped,
    props.outcomeTyped,
    props.scenario,
    props.selected,
  ]);

  return (
    <div className="xl:col-span-9 border-b xl:border-b-0 xl:border-r border-[color:var(--terminal-border)]">
      <div
        ref={scrollerRef}
        className="h-[750px] overflow-y-auto px-6 py-8"
      >
        <div className="space-y-4 text-[16px] leading-8">
          {props.mode === "idle" ? (
            themeId === "urban" ? (
              // ── Urban idle screen ───────────────────────────────────────────
              <div className="space-y-8 animate-in fade-in duration-700 font-sans">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: theme.colors.accent }} />
                  <span className="text-[14px] font-semibold" style={{ color: theme.colors.text }}>
                    {theme.ui.idleTitle}
                  </span>
                </div>

                <div className="rounded-2xl p-8 space-y-6 border-l-4" style={{ background: theme.colors.surfaceAlt, borderColor: theme.colors.accent }}>
                  <div className="text-xs font-medium tracking-widest" style={{ color: theme.colors.accentAlt }}>Chỉ lệnh · Nhiệm vụ</div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold" style={{ color: theme.colors.text }}>Nhiệm vụ đã sẵn sàng</h3>
                    <p className="text-sm leading-relaxed" style={{ color: theme.colors.textMuted }}>
                      Hệ thống trọng sinh đã kết nối. Mỗi lựa chọn bạn thực hiện hôm nay sẽ thay đổi quỹ đạo cuộc đời. Hãy sử dụng ngôn ngữ đúng lúc — đó là vũ khí mạnh nhất bạn có.
                    </p>
                  </div>
                  <div className="pt-4 border-t" style={{ borderColor: `${theme.colors.accent}20` }}>
                    <div className="text-xs mb-2" style={{ color: theme.colors.accentAlt }}>Mục tiêu</div>
                    <div className="text-sm font-semibold flex items-center gap-3" style={{ color: theme.colors.text }}>
                      <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: theme.colors.accent }} />
                      Chinh phục bằng Phrasal Verbs đúng thời điểm
                    </div>
                  </div>
                </div>

                <div className="text-sm italic leading-relaxed pl-4 border-l-2" style={{ borderColor: theme.colors.border, color: theme.colors.textMuted }}>
                  &quot;Ngôn ngữ không phải công cụ — đó là thứ phân biệt bạn với tất cả những người còn lại.&quot;
                </div>

                {props.error ? (
                  <div className="p-4 rounded-xl border text-sm flex items-center gap-3" style={{ background: `${theme.colors.danger}12`, borderColor: `${theme.colors.danger}40`, color: theme.colors.danger }}>
                    <ShieldAlert className="h-5 w-5" />{props.error}
                  </div>
                ) : null}

                <button type="button" onClick={props.onStart}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base text-white transition-all hover:brightness-110 active:scale-[0.99]"
                  style={{ background: theme.colors.accent }}>
                  Bắt đầu ngay
                  <Zap className="h-4 w-4" />
                </button>
              </div>
            ) : (
              // ── Synapse idle screen ─────────────────────────────────────────
              <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 border ${props.accentClass} bg-black`}>
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <span className="uppercase tracking-[0.3em] text-[14px] font-black text-white">
                    NEURAL_LINK_ESTABLISHED
                  </span>
                </div>

                <div className={`${props.borderClass} bg-[#3dff7a]/5 border-l-4 border-[#3dff7a] p-8 space-y-6 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Zap className="h-32 w-32" />
                  </div>
                  <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.4em] text-[#3dff7a] font-bold">
                    <Info className="h-4 w-4" />
                    Mission Intelligence
                  </div>
                  <div className="space-y-4 relative z-10">
                    <h3 className="text-[18px] font-black uppercase tracking-tight text-white italic">Mission Directive</h3>
                    <p className="text-white/80 text-[14px] leading-relaxed max-w-2xl">
                      Hệ thống đã sẵn sàng thâm nhập. Bạn đang đứng trước ngưỡng cửa của Core dữ liệu. Mọi hành động đều được giám sát bởi Cerberus AI. Hãy sử dụng Phrasal Reflex để vượt qua các lớp bảo mật.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-[#3dff7a]/20">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-[#3dff7a]/60 mb-3 font-black">Primary Objective Parameters</div>
                    <div className="text-[15px] text-white font-black uppercase tracking-tighter flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-[#3dff7a] animate-ping" />
                      Neutralize Cerberus Sanctum Core
                    </div>
                  </div>
                </div>

                <div className="text-white/60 text-[14px] italic leading-relaxed border-l border-white/10 pl-4">
                  &quot;Trong bóng tối của megacorp, ngôn ngữ là vũ khí duy nhất còn lại của bạn.&quot;
                </div>

                {props.error ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/50 text-[color:var(--terminal-danger)] text-[14px] font-bold flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5" />
                    ERROR_LOG: {props.error}
                  </div>
                ) : null}

                <button type="button" onClick={props.onStart}
                  className={`${props.borderClass} group relative inline-flex items-center gap-4 px-8 py-4 text-[14px] font-black uppercase tracking-[0.3em] text-[#0a0a0a] bg-[#3dff7a] hover:bg-white transition-all overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
                  <Zap className="h-5 w-5 fill-current" />
                  INITIATE_DEPLOYMENT
                </button>
              </div>
            )
          ) : null}

          {props.mode === "loading" ? (
            <div className={`flex items-center gap-2 ${mutedClass} text-[15px]`}>
              <CircleDashed
                className={`h-5 w-5 animate-spin ${props.accentClass}`}
              />
              <span>Fetching scenario…</span>
            </div>
          ) : null}

          {props.pastStages && props.pastStages.length > 0 ? (
            <div className="space-y-8 mb-8 pb-8 border-b border-[color:var(--terminal-border)]">
              {props.pastStages.map((ps, idx) => (
                <div key={idx} className="space-y-4 opacity-50 grayscale">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`${props.borderClass} px-3 py-1.5 text-[12px] ${mutedClass}`}
                    >
                      {ps.scenario.missionCode}
                    </span>
                    {ps.scenario.baseVerb !== "___" ? (
                      <span
                        className={`${props.borderClass} px-3 py-1.5 text-[12px] ${mutedClass}`}
                      >
                        BASE VERB:{" "}
                        <span className={props.accentClass}>
                          {ps.scenario.baseVerb}
                        </span>
                      </span>
                    ) : null}
                  </div>

                  <div className={`${textClass} whitespace-pre-wrap text-[16px]`}>
                    <span className={props.accentClass}>&gt; </span>
                    {ps.scenario.narrative}
                  </div>

                  <div className={`${textClass} whitespace-pre-wrap text-[16px] mt-4`}>
                    <span className={props.accentClass}>&gt; </span>
                    {ps.selected.outcome}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {props.scenario ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`${props.borderClass} px-3 py-1.5 text-[12px] ${mutedClass}`}
                >
                  {props.scenario.missionCode}
                </span>
                {props.scenario.baseVerb !== "___" ? (
                  <span
                    className={`${props.borderClass} px-3 py-1.5 text-[12px] ${mutedClass}`}
                  >
                    BASE VERB:{" "}
                    <span className={props.accentClass}>
                      {props.scenario.baseVerb}
                    </span>
                  </span>
                ) : null}
              </div>

              <div className={`${textClass} whitespace-pre-wrap text-[16px]`}>
                <span className={props.accentClass}>&gt; </span>
                {props.mode === "narrative"
                  ? props.narrativeTyped
                  : props.narrativeText}
                {props.mode === "narrative" && !props.narrativeDone ? (
                  <span className={`${props.accentClass} ml-1 animate-pulse`}>
                    ▌
                  </span>
                ) : null}
              </div>

              {props.selected ? (
                <div className={`${textClass} whitespace-pre-wrap text-[16px] mt-4`}>
                  <span className={props.accentClass}>&gt; </span>
                  {props.mode === "outcome"
                    ? props.outcomeTyped
                    : props.outcomeText}
                  {props.mode === "outcome" && !props.outcomeDone ? (
                    <span className={`${props.accentClass} ml-1 animate-pulse`}>
                      ▌
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-[color:var(--terminal-border)]">
        <div className="flex flex-col gap-2">
          <div className={`text-[12px] ${dimClass} uppercase tracking-widest`}>
            Command
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`${props.borderClass} px-3 py-3 text-[14px] ${mutedClass} flex-1`}
            >
              {props.scenario ? "$ select-particle" : "$ run"}
            </div>
            <button
              type="button"
              onClick={props.onStart}
              className={`${props.borderClass} px-4 py-3 text-[14px] ${textClass} hover:opacity-100 uppercase tracking-widest transition-colors font-bold`}
              disabled={props.mode === "loading"}
            >
              Run
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
