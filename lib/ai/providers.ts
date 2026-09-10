import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import type { LanguageModelV4 } from "@ai-sdk/provider";
import { customProvider, type LanguageModel, wrapLanguageModel } from "ai";
import { isTestEnvironment } from "../constants";
import {
  DEFAULT_CHAT_MODEL,
  GEMINI_FLASH_MODEL,
  GROQ_TITLE_MODEL,
  type ModelId,
} from "./models";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not configured. Add it to your environment variables."
    );
  }

  return createGroq({ apiKey });
}

function getGoogleClient() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return null;
  }

  return createGoogleGenerativeAI({ apiKey });
}

function resolveProviderModel(modelId: ModelId): LanguageModelV4 {
  if (modelId === GEMINI_FLASH_MODEL) {
    const google = getGoogleClient();

    if (!google) {
      throw new Error(
        "GOOGLE_GENERATIVE_AI_API_KEY is not configured for Gemini Flash."
      );
    }

    return google("gemini-2.0-flash");
  }

  const groq = getGroqClient();

  if (modelId === GROQ_TITLE_MODEL) {
    return groq("llama-3.1-8b-instant");
  }

  return groq("llama-3.3-70b-versatile");
}

function withGeminiFailover(model: LanguageModelV4): LanguageModel {
  const google = getGoogleClient();

  if (!google) {
    return model;
  }

  const fallbackModel = google("gemini-2.0-flash");

  return wrapLanguageModel({
    middleware: {
      wrapStream: async ({ doStream, params }) => {
        try {
          return await doStream();
        } catch (error) {
          console.warn(
            "[failover] Groq request failed, retrying with Gemini Flash",
            error
          );
          return await fallbackModel.doStream(params);
        }
      },
    },
    model,
  });
}

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        chatModel,
        titleModel: mockTitleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": mockTitleModel,
        },
      });
    })()
  : null;

export function getLanguageModel(modelId: string): LanguageModel {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("chat-model");
  }

  const resolvedModel = resolveProviderModel(modelId as ModelId);

  if (modelId === DEFAULT_CHAT_MODEL) {
    return withGeminiFailover(resolvedModel);
  }

  return resolvedModel;
}

export function getTitleModel(): LanguageModel {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }

  return resolveProviderModel(GROQ_TITLE_MODEL);
}

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}
