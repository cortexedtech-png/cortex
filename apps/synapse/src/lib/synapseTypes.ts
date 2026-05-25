import { ActionLog, SynapseChoice, SynapseScenario, StoryArc } from "@cortex/types";

export type { SynapseChoice, SynapseScenario, StoryArc };

export type ScenarioRequest = {
  sessionId: string;
  stage: number;
  loreId?: string;
  missionId?: string;
  sessionHistory?: ActionLog[];
};

export type StoryArcRequest = {
  sessionId: string;
  loreId?: string;
  missionId?: string;
};
