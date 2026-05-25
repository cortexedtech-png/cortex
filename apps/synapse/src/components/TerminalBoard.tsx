"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ActionLog } from "@cortex/types";
import { apiClient } from "../lib/apiClient";
import type { SynapseChoice, SynapseScenario } from "../lib/synapseTypes";
import type { StoryArc } from "../lib/synapseTypes";
import { useTypewriter } from "../hooks/useTypewriter";
import { TerminalHeader } from "./TerminalHeader";
import { TerminalOptions } from "./TerminalOptions";
import { TerminalOutput, type TerminalMode } from "./TerminalOutput";
import { useTheme } from "../context/ThemeContext";

function makeId() {
  return Math.random().toString(36).slice(2);
}

function nowIso() {
  return new Date().toISOString();
}

function toActionLog(
  sessionId: string,
  actionType: string,
  metadata: Record<string, unknown>,
): ActionLog {
  return {
    id: makeId(),
    userId: sessionId,
    appSource: "synapse",
    actionType,
    metadata,
    timestamp: new Date(),
  };
}

export function TerminalBoard(props: {
  initialLoreId?: string;
  initialMissionId?: string;
  onExit?: () => void
}) {
  const [sessionId, setSessionId] = useState<string>(makeId());
  const [currentStage, setCurrentStage] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [integrity, setIntegrity] = useState(100);
  const [loreId] = useState(props.initialLoreId || "cyberpunk-01");
  const [missionId] = useState(props.initialMissionId);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMissionClear, setIsMissionClear] = useState(false);
  const [mode, setMode] = useState<TerminalMode>("idle");
  const maxStages = 5;
  const [scenario, setScenario] = useState<SynapseScenario | null>(null);
  const [storyArc, setStoryArc] = useState<SynapseScenario[]>([]);
  const [selected, setSelected] = useState<SynapseChoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionHistory, setSessionHistory] = useState<ActionLog[]>([]);
  const [pastStages, setPastStages] = useState<
    Array<{ scenario: SynapseScenario; selected: SynapseChoice }>
  >([]);
  const [accent, setAccent] = useState<"green" | "amber">("green");
  const { themeId, theme } = useTheme();

  const historyRef = useRef<ActionLog[]>([]);
  const storyArcRef = useRef<SynapseScenario[]>([]);

  useEffect(() => {
    historyRef.current = sessionHistory;
  }, [sessionHistory]);

  useEffect(() => {
    storyArcRef.current = storyArc;
  }, [storyArc]);

  // Urban theme uses CSS variable accent; synapse allows toggle
  const accentClass =
    themeId === "urban"
      ? "text-[color:var(--t-accent)]"
      : accent === "green" ? "text-[#3dff7a]" : "text-[#ffb020]";
  const borderClass = "border border-[color:var(--terminal-border)]";

  const narrativeText = useMemo(() => scenario?.narrative || "", [scenario]);
  const outcomeText = useMemo(() => selected?.outcome || "", [selected]);

  const narrativeTw = useTypewriter(narrativeText, {
    cps: 70,
    enabled: mode === "narrative",
  });
  const outcomeTw = useTypewriter(outcomeText, {
    cps: 70,
    enabled: mode === "outcome",
  });

  function loadStageFromArc(stage: number) {
    const arc = storyArcRef.current;
    const s = arc[stage - 1];
    if (!s) {
      setError(`Không tìm thấy stage ${stage} trong story arc`);
      return;
    }
    setScenario(null);
    setSelected(null);
    setScenario(s);
    setMode("narrative");
  }

  async function onStart() {
    const newSessionId = makeId();
    setSessionId(newSessionId);
    setCurrentStage(1);
    setScore(0);
    setLives(3);
    setIntegrity(100);
    setIsGameOver(false);
    setIsMissionClear(false);
    setScenario(null);
    setStoryArc([]);
    setSelected(null);
    setError(null);
    setPastStages([]);
    setSessionHistory([
      {
        id: makeId(),
        userId: newSessionId,
        appSource: "synapse",
        actionType: "START_SESSION",
        metadata: { at: nowIso() },
        timestamp: new Date(),
      },
    ]);

    try {
      setMode("loading");
      const arc: StoryArc = await apiClient.fetchStoryArc({
        sessionId: newSessionId,
        loreId,
        missionId,
      });
      storyArcRef.current = arc.stages;
      setStoryArc(arc.stages);
      setScenario(arc.stages[0] ?? null);
      setMode("narrative");
    } catch (e) {
      setMode("idle");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function onChoose(choice: SynapseChoice) {
    if (!scenario) return;
    if (isGameOver) return;
    if (!narrativeTw.done) return;

    setSelected(choice);
    setMode("outcome");

    setSessionHistory((h) =>
      h.concat(
        toActionLog(sessionId, "CHOOSE_PARTICLE", {
          missionCode: scenario.missionCode,
          baseVerb: scenario.baseVerb,
          particle: choice.particle,
          isCorrect: choice.isCorrect,
          narrative: scenario.narrative,
          outcome: choice.outcome,
          at: nowIso(),
        }),
      ),
    );

    if (choice.isCorrect) {
      setScore((s) => s + 10);

      // Apply gameplay effects from correct choices
      if (choice.effect === 'restore_life') {
        setLives((l) => Math.min(3, l + 1));
      } else if (choice.effect === 'integrity_boost') {
        setIntegrity((i) => Math.min(100, i + 20));
      }
    } else {
      setScore((s) => Math.max(0, s - 10));
      setIntegrity((i) => Math.max(0, i - 25)); // Mistake reduces system integrity

      const nextLives = lives - 1;
      setLives(nextLives);
      if (nextLives <= 0) {
        setIsGameOver(true);
      }
    }
  }

  async function onContinue() {
    if (!scenario) return;
    if (!selected?.isCorrect) return;
    if (!outcomeTw.done) return;

    setPastStages((prev) => [...prev, { scenario, selected }]);

    if (currentStage >= maxStages) {
      setIsMissionClear(true);
      setMode("idle");
      return;
    }

    const nextStage = currentStage + 1;
    setCurrentStage(nextStage);
    loadStageFromArc(nextStage);
  }

  function onRetry() {
    if (!scenario) return;
    if (isGameOver) return;
    loadStageFromArc(currentStage);
  }

  function onRestart() {
    if (props.onExit) {
      props.onExit();
      return;
    }
    void onStart();
  }

  return (
    <div className="flex-1 w-full relative overflow-hidden" style={{ background: theme.colors.bg }}>
      {themeId === "synapse" && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#3dff7a 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      )}

      <div className="mx-auto w-full max-w-[1400px] px-2 md:px-4 py-2 md:py-4 relative z-10">
        <div
          className={themeId === 'urban'
            ? 'rounded-2xl bg-white border border-[#e2dfd8] shadow-sm overflow-hidden'
            : `${borderClass} bg-[#0b0b0b]/90 backdrop-blur-sm shadow-[0_0_50px_rgba(0,0,0,0.7)]`}
          style={themeId === 'urban' ? {} : { boxShadow: "0 0 0 1px rgba(61,255,122,0.1) inset" }}
        >
          <TerminalHeader
            currentStage={currentStage}
            maxStages={maxStages}
            score={score}
            lives={lives}
            integrity={integrity}
            isGameOver={isGameOver}
            isMissionClear={isMissionClear}
            accent={accent}
            accentClass={accentClass}
            onToggleAccent={() =>
              setAccent((a) => (a === "green" ? "amber" : "green"))
            }
            onRestart={onRestart}
          />

          <div className="grid grid-cols-1 xl:grid-cols-12">
            <TerminalOutput
              mode={mode}
              accentClass={accentClass}
              borderClass={borderClass}
              scenario={scenario}
              selected={selected}
              narrativeText={narrativeText}
              narrativeTyped={narrativeTw.text}
              narrativeDone={narrativeTw.done}
              outcomeText={outcomeText}
              outcomeTyped={outcomeTw.text}
              outcomeDone={outcomeTw.done}
              error={error}
              onStart={onStart}
              pastStages={pastStages}
            />

            <div className={`xl:col-span-3 ${themeId === 'urban' ? 'bg-[#faf9f7] border-l border-[#e2dfd8]' : 'bg-black/20'}`}>
              <div className="px-4 py-6 space-y-6">
                <TerminalOptions
                  mode={mode}
                  accentClass={accentClass}
                  borderClass={borderClass}
                  scenario={scenario}
                  narrativeDone={narrativeTw.done}
                  selected={selected}
                  isGameOver={isGameOver}
                  outcomeDone={outcomeTw.done}
                  onChoose={onChoose}
                  onContinue={onContinue}
                  onRetry={onRetry}
                  onRestart={onRestart}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
