import type { ScenarioRequest, StoryArcRequest, SynapseScenario, StoryArc } from "./synapseTypes";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseJsonSafe<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(text || "Invalid JSON response", res.status);
  }
}

export const apiClient = {
  async fetchScenario(payload: ScenarioRequest): Promise<SynapseScenario> {
    const res = await fetch("/api/scenario", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await parseJsonSafe<{ error?: string }>(res);
      throw new ApiError(data.error || "Failed to fetch scenario", res.status);
    }

    return parseJsonSafe<SynapseScenario>(res);
  },

  async fetchStoryArc(payload: StoryArcRequest): Promise<StoryArc> {
    const res = await fetch("/api/story-arc", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await parseJsonSafe<{ error?: string }>(res);
      throw new ApiError(data.error || "Failed to fetch story arc", res.status);
    }

    return parseJsonSafe<StoryArc>(res);
  },
};
