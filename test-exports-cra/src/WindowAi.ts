import { LLM, BaseLLMParams } from "langchain/llms/base.js";

export enum ModelID {
  GPT3 = "openai/gpt3.5",
  GPT4 = "openai/gpt4",
  GPTNeo = "together/gpt-neoxt-20B",
  Cohere = "cohere/xlarge",
  Local = "local",
}

export interface CompletionOptions {
  onStreamResult?: (result: Output | null, error: string | null) => unknown;
  temperature?: number;
  numOutputs?: number;
  maxTokens?: number;
  stopSequences?: string[];
  model?: ModelID;
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type Output = { text: string } | { message: ChatMessage };
export type Input = { prompt: string } | { messages: ChatMessage[] };

interface WindowAiInput extends BaseLLMParams {
  completionOptions?: CompletionOptions;
}

export class WindowAi extends LLM implements WindowAiInput {
  completionOptions: CompletionOptions;
  globalContext: any;

  constructor(fields?:  Partial<WindowAiInput>) {
    super(fields ?? {});

    this.completionOptions = fields?.completionOptions ?? {};

    this.globalContext =
      typeof window !== "undefined" ? window : globalThis;

    this._ensureAiAvailable();
  }

  _llmType(): string {
    return "windowai";
  }

  async _call(prompt: string): Promise<string> {
    await this._ensureAiAvailable()
    const input: Input = typeof prompt === "string" ? { prompt } : { messages: prompt };
    try {
      const output = await this.globalContext.ai.getCompletion(input, this.completionOptions);
      return output.text;
    } catch (error) {
      console.log(error);
      throw new Error("Could not generate response from WindowAi.");
    }
  }

  async getCurrentModel(): Promise<string> {
    try {
      const modelID = await this.globalContext.ai.getCurrentModel();
      return modelID;
    } catch (error) {
      console.log(error);
      throw new Error("Could not retrieve current model from WindowAi.");
    }
  }

  private async _ensureAiAvailable(): Promise<void> {
    let timeoutCounter = 0;
    while (!this.globalContext.ai) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      timeoutCounter += 100;
      if (timeoutCounter >= 1000) {
        console.error("Please visit https://windowai.io to install WindowAi.");
        break;
      }
    }

    if (this.globalContext.ai) {
      console.log("WindowAi detected!");
    }
  }
}
