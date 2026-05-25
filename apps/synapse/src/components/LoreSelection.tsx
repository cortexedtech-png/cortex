"use client";

import { useState } from "react";
import {
  Globe, Cpu, ShieldAlert, Zap, Skull, Database, Lock,
  ChevronRight, Terminal, Activity, Crosshair,
  Building2, Briefcase, ChefHat, FileText, Users, Smartphone, TrendingUp,
  ArrowLeft,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import type { WorldLore, ThemeUI, ThemeColors } from "../lib/themes";
import { TerminalBoard } from "./TerminalBoard";

// ─── Icon Maps ────────────────────────────────────────────────────────────────

const LORE_ICONS: Record<string, React.ReactNode> = {
  "cyberpunk-01": <Cpu className="w-8 h-8" />,
  "wasteland-01": <Globe className="w-8 h-8" />,
  "urban-01": <Briefcase className="w-8 h-8" />,
  "urban-02": <ChefHat className="w-8 h-8" />,
};

const MISSION_ICONS: Record<string, React.ReactNode> = {
  "cp-m1": <Lock className="w-5 h-5" />,
  "cp-m2": <Database className="w-5 h-5" />,
  "wl-m1": <Crosshair className="w-5 h-5" />,
  "ur-m1": <FileText className="w-5 h-5" />,
  "ur-m2": <Users className="w-5 h-5" />,
  "ur2-m1": <Smartphone className="w-5 h-5" />,
  "ur2-m2": <TrendingUp className="w-5 h-5" />,
};

const SYNAPSE_FACTION_ICONS: Record<string, React.ReactNode> = {
  OmniCorp: <ShieldAlert className="w-4 h-4" />,
  "The Glitch": <Activity className="w-4 h-4" />,
  "Cerberus AI": <Skull className="w-4 h-4" />,
  "The Scavengers": <Zap className="w-4 h-4" />,
  "The Iron Sentinels": <ShieldAlert className="w-4 h-4" />,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LoreSelection({ onBack }: { onBack?: () => void }) {
  const { theme, themeId } = useTheme();
  const lores = theme.lores;

  const [selectedLoreId, setSelectedLoreId] = useState<string | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);

  const selectedLore = lores.find((l) => l.id === selectedLoreId);
  const selectedMission = selectedLore?.missions.find((m) => m.id === selectedMissionId);

  if (showGame && selectedLoreId && selectedMissionId) {
    return (
      <TerminalBoard
        initialLoreId={selectedLoreId}
        initialMissionId={selectedMissionId}
        onExit={() => {
          setShowGame(false);
          setSelectedMissionId(null);
        }}
      />
    );
  }

  if (themeId === "urban") {
    return (
      <UrbanLoreSelection
        lores={lores}
        selectedLoreId={selectedLoreId}
        selectedLore={selectedLore}
        selectedMissionId={selectedMissionId}
        selectedMission={selectedMission}
        onSelectLore={setSelectedLoreId}
        onSelectMission={setSelectedMissionId}
        onStart={() => setShowGame(true)}
        onBack={onBack}
        ui={theme.ui}
        colors={theme.colors}
      />
    );
  }

  return (
    <SynapseLoreSelection
      lores={lores}
      selectedLoreId={selectedLoreId}
      selectedLore={selectedLore}
      selectedMissionId={selectedMissionId}
      selectedMission={selectedMission}
      onSelectLore={setSelectedLoreId}
      onSelectMission={setSelectedMissionId}
      onStart={() => setShowGame(true)}
      onBack={onBack}
      ui={theme.ui}
      colors={theme.colors}
    />
  );
}

// ─── Shared prop type ─────────────────────────────────────────────────────────

interface LoreSelectionProps {
  lores: WorldLore[];
  selectedLoreId: string | null;
  selectedLore: WorldLore | undefined;
  selectedMissionId: string | null;
  selectedMission: WorldLore["missions"][number] | undefined;
  onSelectLore: (id: string | null) => void;
  onSelectMission: (id: string | null) => void;
  onStart: () => void;
  onBack?: () => void;
  ui: ThemeUI;
  colors: ThemeColors;
}

// ─────────────────────────────────────────────────────────────────────────────
// SYNAPSE: Terminal Brutalist UI
// ─────────────────────────────────────────────────────────────────────────────

function SynapseLoreSelection({
  lores, selectedLoreId, selectedLore, selectedMissionId, selectedMission,
  onSelectLore, onSelectMission, onStart, onBack, ui,
}: LoreSelectionProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#3dff7a] font-mono p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#3dff7a 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="max-w-6xl w-full border border-[#3dff7a]/30 p-6 md:p-12 bg-[#0a0a0a] shadow-[0_0_30px_rgba(61,255,122,0.1)] overflow-y-auto max-h-[90vh] relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8 border-b-4 border-[#3dff7a] pb-4">
          <div className="flex items-center gap-4">
            <Terminal className="w-10 h-10 md:w-14 md:h-14" />
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">SYNAPSE.ARCHITECT</h1>
          </div>
          {onBack && (
            <button onClick={onBack} className="text-[10px] text-[#3dff7a]/40 hover:text-[#3dff7a] transition-colors flex items-center gap-1 uppercase tracking-widest">
              <ArrowLeft className="w-3 h-3" /> UNIVERSE_SELECT
            </button>
          )}
        </div>

        {/* World Select */}
        {!selectedLoreId && (
          <div className="space-y-8">
            <div className="text-lg opacity-80 leading-relaxed flex items-center gap-3">
              <Activity className="w-5 h-5 animate-pulse" />
              <span>{ui.worldSelectPrompt}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {lores.map((lore) => (
                <button key={lore.id} onClick={() => onSelectLore(lore.id)}
                  className="group relative border border-[#3dff7a]/50 p-6 text-left hover:bg-[#3dff7a] hover:text-[#0a0a0a] transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 border border-current">{LORE_ICONS[lore.id] ?? <Globe className="w-8 h-8" />}</div>
                    <div className="text-[10px] font-bold border border-current px-2 py-1 opacity-50">ID: {lore.id.toUpperCase()}</div>
                  </div>
                  <div className="text-xl font-bold mb-2 uppercase tracking-tight">{lore.name}</div>
                  <div className="text-sm opacity-70 group-hover:opacity-100 line-clamp-3 leading-relaxed">{lore.context}</div>
                  <div className="mt-6 text-xs font-bold underline flex items-center gap-2">
                    <ChevronRight className="w-3 h-3" />{ui.selectWorldCta}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mission Select */}
        {selectedLoreId && !selectedMissionId && selectedLore && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => onSelectLore(null)}
              className="text-xs opacity-50 hover:opacity-100 underline mb-6 flex items-center gap-2">
              <span>[</span><ChevronRight className="w-3 h-3 rotate-180" /><span>{ui.backLabel} ]</span>
            </button>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-6 border-r border-[#3dff7a]/10 pr-8">
                <div className="flex items-center gap-4">
                  <div className="p-2 border border-[#3dff7a] bg-[#3dff7a]/10">
                    {LORE_ICONS[selectedLoreId] ?? <Globe className="w-8 h-8" />}
                  </div>
                  <h2 className="text-3xl font-bold uppercase tracking-widest text-white">{selectedLore.name}</h2>
                </div>
                <div className="p-4 bg-[#3dff7a]/5 border-l-4 border-[#3dff7a] text-sm leading-relaxed text-white/90 italic relative">
                  <Zap className="absolute -top-2 -right-2 w-5 h-5 text-[#3dff7a]/20" />
                  {selectedLore.context}
                </div>
                {selectedLore.factions.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#3dff7a]/60 flex items-center gap-2">
                      <Crosshair className="w-4 h-4" />{ui.factionsLabel}
                    </div>
                    <div className="grid gap-4">
                      {selectedLore.factions.map((f) => (
                        <div key={f.name} className="border border-[#3dff7a]/20 p-4 bg-[#0a0a0a]/50 hover:border-[#3dff7a]/50 transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#3dff7a]">{SYNAPSE_FACTION_ICONS[f.name] ?? <ShieldAlert className="w-4 h-4" />}</span>
                            <div className="text-sm font-bold text-[#3dff7a] uppercase">{f.name}</div>
                          </div>
                          <div className="text-[11px] opacity-70 mb-2 leading-relaxed">{f.description}</div>
                          <div className="text-[9px] uppercase tracking-wider text-white/40 border-t border-[#3dff7a]/10 pt-2">MỤC TIÊU: {f.ultimateGoal}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-6">
                <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#3dff7a]/80 flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-pulse" />{ui.missionSelectLabel}
                </div>
                <div className="grid gap-4">
                  {selectedLore.missions.map((mission) => (
                    <button key={mission.id} onClick={() => onSelectMission(mission.id)}
                      className="group border border-[#3dff7a]/30 p-5 text-left hover:border-[#3dff7a] hover:bg-[#3dff7a]/5 transition-all relative overflow-hidden">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 border border-[#3dff7a]/30 group-hover:border-[#3dff7a] group-hover:bg-[#3dff7a] group-hover:text-[#0a0a0a] transition-colors">
                          {MISSION_ICONS[mission.id] ?? <ChevronRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-xl font-bold uppercase tracking-tight group-hover:text-white mb-2">{mission.name}</div>
                          <div className="text-xs opacity-60 group-hover:opacity-100 leading-relaxed">{mission.briefing}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-4 border border-dashed border-[#3dff7a]/20 opacity-40 flex gap-3 items-start">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <div className="text-[10px] leading-relaxed italic">
                    [ CẢNH BÁO ]: MỌI DỮ LIỆU THÂM NHẬP SẼ BỊ XÓA SAU KHI KẾT THÚC PHIÊN.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mission Briefing */}
        {selectedMissionId && selectedLore && selectedMission && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => onSelectMission(null)}
              className="text-xs opacity-50 hover:opacity-100 underline flex items-center gap-2">
              <span>[</span><ChevronRight className="w-3 h-3 rotate-180" /><span>QUAY LẠI CHỌN NHIỆM VỤ ]</span>
            </button>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 border-2 border-[#3dff7a] bg-[#3dff7a]/10">
                    {MISSION_ICONS[selectedMission.id] ?? <ChevronRight className="w-5 h-5" />}
                  </div>
                  <h2 className="text-3xl font-bold uppercase tracking-widest text-white">MISSION_BRIEFING: {selectedMission.name}</h2>
                </div>
                <div className="space-y-6 text-sm leading-relaxed border-l-2 border-[#3dff7a] pl-6 py-2">
                  <p className="text-white/80 italic leading-relaxed text-lg">&quot;{selectedMission.briefing}&quot;</p>
                  <div className="p-5 bg-[#3dff7a]/10 border border-[#3dff7a]/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5"><Crosshair className="w-20 h-20" /></div>
                    <div className="font-bold text-[#3dff7a] mb-2 uppercase tracking-widest text-xs flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" /> MỤC TIÊU CHIẾN DỊCH:
                    </div>
                    <div className="text-white font-medium text-base relative z-10">{selectedMission.objective}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="p-6 border border-[#3dff7a]/20 bg-[#3dff7a]/5">
                  <div className="text-xs font-bold text-[#3dff7a] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Terminal Protocols:
                  </div>
                  <ul className="text-[11px] space-y-3 opacity-80 font-medium">
                    <li className="flex gap-2"><span className="text-[#3dff7a]">01.</span>Sử dụng Phrasal Verbs để thao tác hệ thống.</li>
                    <li className="flex gap-2"><span className="text-[#3dff7a]">02.</span>Mỗi lựa chọn sai giảm Integrity.</li>
                    <li className="flex gap-2"><span className="text-[#3dff7a]">03.</span>Integrity về 0 hoặc hết Life = System Wipeout.</li>
                    <li className="flex gap-2"><span className="text-[#3dff7a]">04.</span>Vượt qua 5 Stage để hoàn thành Mission.</li>
                  </ul>
                </div>
              </div>
            </div>
            <button onClick={onStart}
              className="w-full py-5 bg-[#3dff7a] text-[#0a0a0a] font-black text-2xl uppercase tracking-[0.3em] hover:bg-white transition-all shadow-[0_0_40px_rgba(61,255,122,0.3)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-4 group">
              <Zap className="w-6 h-6 fill-current group-hover:animate-bounce" />
              INITIATE_NEURAL_LINK
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// URBAN: Modern Clean UI  
// "Hiện đại, cuộc sống bình thường"
// ─────────────────────────────────────────────────────────────────────────────

function UrbanLoreSelection({
  lores, selectedLoreId, selectedLore, selectedMissionId, selectedMission,
  onSelectLore, onSelectMission, onStart, onBack, ui, colors,
}: LoreSelectionProps) {
  const accent = colors.accent;
  const gold = colors.accentAlt;
  const surface = colors.surface;
  const surfaceAlt = colors.surfaceAlt;
  const border = colors.border;
  const text = colors.text;
  const textMuted = colors.textMuted;
  const bg = colors.bg;

  return (
    <div
      className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden font-sans"
      style={{ background: bg }}
    >
      {/* City ambient glow */}
      <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none opacity-[0.04]"
        style={{ background: `linear-gradient(to top, ${accent}, transparent)` }} />

      <div className="max-w-5xl w-full overflow-y-auto max-h-[92vh] relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent }} />
              <span className="text-xs tracking-widest" style={{ color: textMuted }}>{ui.systemOnline}</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: text }}>Đô Thị Trọng Sinh</h1>
          </div>
          {onBack && (
            <button onClick={onBack}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl border transition-colors hover:opacity-80"
              style={{ borderColor: border, color: textMuted }}>
              <ArrowLeft className="w-4 h-4" /> Đổi vũ trụ
            </button>
          )}
        </div>

        {/* World Select */}
        {!selectedLoreId && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <p className="text-lg" style={{ color: text }}>{ui.worldSelectPrompt}</p>
            <div className="grid md:grid-cols-2 gap-5">
              {lores.map((lore) => (
                <button key={lore.id} onClick={() => onSelectLore(lore.id)}
                  className="group text-left rounded-2xl border p-6 transition-all duration-300 relative overflow-hidden"
                  style={{ background: surface, borderColor: border }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = `${accent}60`;
                    el.style.boxShadow = `0 0 28px ${accent}12`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = border;
                    el.style.boxShadow = "none";
                  }}>
                  <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl"
                    style={{ background: `linear-gradient(90deg, ${accent}, ${gold})` }} />

                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl" style={{ background: `${accent}15`, color: accent }}>
                      {LORE_ICONS[lore.id] ?? <Building2 className="w-8 h-8" />}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold" style={{ color: text }}>{lore.name}</h2>
                      <p className="text-xs mt-0.5" style={{ color: accent }}>{lore.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed line-clamp-3" style={{ color: textMuted }}>{lore.context}</p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: `${gold}30`, color: gold }}>
                      {lore.missions.length} nhiệm vụ
                    </span>
                    <span className="text-sm font-medium flex items-center gap-1" style={{ color: accent }}>
                      {ui.selectWorldCta} <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mission Select */}
        {selectedLoreId && !selectedMissionId && selectedLore && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-400">
            <button onClick={() => onSelectLore(null)}
              className="flex items-center gap-2 text-sm mb-6 hover:opacity-80 transition-opacity"
              style={{ color: textMuted }}>
              <ArrowLeft className="w-4 h-4" /> {ui.backLabel}
            </button>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Left: Lore info */}
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl" style={{ background: `${accent}12`, color: accent }}>
                    {LORE_ICONS[selectedLoreId] ?? <Building2 className="w-8 h-8" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: text }}>{selectedLore.name}</h2>
                    <p className="text-sm" style={{ color: accent }}>{selectedLore.subtitle}</p>
                  </div>
                </div>

                <div className="rounded-2xl p-5 text-sm leading-relaxed" style={{ background: surfaceAlt, color: textMuted }}>
                  {selectedLore.context}
                </div>

                {selectedLore.factions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                      {ui.factionsLabel}
                    </h3>
                    <div className="space-y-3">
                      {selectedLore.factions.map((f) => (
                        <div key={f.name} className="rounded-xl p-4 border" style={{ background: surface, borderColor: border }}>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
                            <span className="font-semibold text-sm" style={{ color: text }}>{f.name}</span>
                          </div>
                          <p className="text-xs leading-relaxed mb-2" style={{ color: textMuted }}>{f.description}</p>
                          <p className="text-[10px] font-medium" style={{ color: gold }}>Mục tiêu: {f.ultimateGoal}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Mission list */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold" style={{ color: textMuted }}>{ui.missionSelectLabel}</h3>
                <div className="space-y-3">
                  {selectedLore.missions.map((mission) => (
                    <button key={mission.id} onClick={() => onSelectMission(mission.id)}
                      className="group w-full text-left rounded-2xl border p-5 transition-all duration-200"
                      style={{ background: surface, borderColor: border }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${accent}50`; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = border; }}>
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl mt-0.5" style={{ background: `${accent}12`, color: accent }}>
                          {MISSION_ICONS[mission.id] ?? <ChevronRight className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold mb-1" style={{ color: text }}>{mission.name}</div>
                          <div className="text-xs leading-relaxed line-clamp-2" style={{ color: textMuted }}>{mission.briefing}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }} />
                      </div>
                    </button>
                  ))}
                </div>
                <div className="rounded-xl p-4 text-xs leading-relaxed" style={{ background: surfaceAlt, color: textMuted }}>
                  <span style={{ color: gold }}>Lưu ý · </span>
                  Mỗi nhiệm vụ có 5 tình huống cần giải quyết bằng Phrasal Verbs đúng lúc, đúng chỗ.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mission Briefing */}
        {selectedMissionId && selectedLore && selectedMission && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-400 space-y-6">
            <button onClick={() => onSelectMission(null)}
              className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
              style={{ color: textMuted }}>
              <ArrowLeft className="w-4 h-4" /> Quay lại chọn nhiệm vụ
            </button>

            <div className="grid md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl" style={{ background: `${accent}12`, color: accent }}>
                    {MISSION_ICONS[selectedMission.id] ?? <ChevronRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-xs font-medium mb-1" style={{ color: textMuted }}>
                      {selectedLore.name} · {ui.missionSelectLabel}
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: text }}>{selectedMission.name}</h2>
                  </div>
                </div>

                <div className="rounded-2xl p-6 border-l-4" style={{ background: surfaceAlt, borderColor: accent }}>
                  <p className="text-base leading-relaxed italic" style={{ color: text }}>
                    &quot;{selectedMission.briefing}&quot;
                  </p>
                </div>

                <div className="rounded-2xl p-5 border" style={{ background: surface, borderColor: `${accent}30` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: textMuted }}>Mục tiêu nhiệm vụ</span>
                  </div>
                  <p className="font-medium" style={{ color: text }}>{selectedMission.objective}</p>
                </div>
              </div>

              <div className="rounded-2xl p-5 border space-y-4" style={{ background: surface, borderColor: border }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: textMuted }}>Quy tắc hệ thống</span>
                </div>
                <ul className="space-y-3 text-sm" style={{ color: textMuted }}>
                  {[
                    `Chọn Phrasal Verb đúng hoàn cảnh để vượt qua tình huống.`,
                    `Lựa chọn sai làm giảm ${ui.integrityLabel} của bạn.`,
                    `Hết ${ui.livesLabel} = Hệ thống reset tiến trình.`,
                    `Hoàn thành 5 nhiệm vụ để chinh phục thế giới.`,
                  ].map((rule, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                        style={{ background: `${accent}20`, color: accent }}>{i + 1}</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button onClick={onStart}
              className="w-full py-4 rounded-2xl font-bold text-lg transition-all hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-3 text-white"
              style={{ background: accent }}>
              Bắt đầu nhiệm vụ
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
