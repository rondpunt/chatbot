export const DEFAULT_CHAT_MODEL = "llama-3.3-70b-versatile";
export const GEMINI_FLASH_MODEL = "gemini-2.0-flash";
export const GROQ_TITLE_MODEL = "llama-3.1-8b-instant";

export type ModelId =
  | typeof DEFAULT_CHAT_MODEL
  | typeof GEMINI_FLASH_MODEL
  | typeof GROQ_TITLE_MODEL;

export const titleModel = {
  description: "Fast Groq model for title generation",
  id: GROQ_TITLE_MODEL,
  name: "Llama 3.1 8B Instant",
  provider: "groq",
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: ModelId;
  name: string;
  provider: string;
  description: string;
};

const staticCapabilities: Record<string, ModelCapabilities> = {
  [DEFAULT_CHAT_MODEL]: {
    reasoning: false,
    tools: true,
    vision: false,
  },
  [GEMINI_FLASH_MODEL]: {
    reasoning: false,
    tools: true,
    vision: true,
  },
};

export const chatModels: ChatModel[] = [
  {
    description: "Primary free chat model via Groq (Llama 3.3 70B)",
    id: DEFAULT_CHAT_MODEL,
    name: "Llama 3.3 70B",
    provider: "groq",
  },
  {
    description: "Failover model via Google Gemini Flash (free tier)",
    id: GEMINI_FLASH_MODEL,
    name: "Gemini 2.0 Flash",
    provider: "google",
  },
];

export function getCapabilities(): Record<string, ModelCapabilities> {
  return staticCapabilities;
}

export const isDemo = process.env.IS_DEMO === "1";

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set<string>(
  chatModels.map((model) => model.id)
);

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);

export type ModelAvailability = "healthy" | "impacted" | "unknown";

export function getModelAvailability(_modelId: string): ModelAvailability {
  return "healthy";
}

export function getAllGatewayModels(): Array<
  ChatModel & { capabilities: ModelCapabilities }
> {
  return chatModels.map((model) => ({
    ...model,
    capabilities: staticCapabilities[model.id] ?? {
      reasoning: false,
      tools: false,
      vision: false,
    },
  }));
}
