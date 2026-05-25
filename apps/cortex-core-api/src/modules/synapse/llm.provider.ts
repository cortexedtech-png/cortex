import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { SynapseScenario } from '@cortex/types';

export interface LlmProvider {
  generateScenario(prompt: string): Promise<SynapseScenario>;
  getName(): string;
}

@Injectable()
export class GeminiProvider implements LlmProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private genAI: GoogleGenerativeAI;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  getName(): string {
    return 'Gemini';
  }

  async generateScenario(prompt: string): Promise<SynapseScenario> {
    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });
    const response = result.response;
    let text = response.text();

    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
    }
    return JSON.parse(text.trim()) as SynapseScenario;
  }
}

@Injectable()
export class GemmaProvider implements LlmProvider {
  private readonly logger = new Logger(GemmaProvider.name);
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('GEMMA_ENDPOINT') ||
      'http://localhost:11434/api/generate';
  }

  getName(): string {
    return 'Gemma (Ollama)';
  }

  async generateScenario(prompt: string): Promise<SynapseScenario> {
    this.logger.log(`Calling Gemma at ${this.baseUrl}`);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma2',
          prompt: prompt,
          stream: false,
          format: 'json',
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemma API error: ${response.statusText}`);
      }

      const data = (await response.json()) as { response: string };
      let text = data.response;

      if (text.startsWith('```json')) {
        text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
      }

      return JSON.parse(text.trim()) as SynapseScenario;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Gemma call failed: ${message}`);
      throw error;
    }
  }
}

@Injectable()
export class GroqProvider implements LlmProvider {
  private readonly logger = new Logger(GroqProvider.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GROQ_API_KEY') || '';
  }

  getName(): string {
    return 'Groq (Llama 3.3)';
  }

  async generateScenario(prompt: string): Promise<SynapseScenario> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not set');
    }

    this.logger.log('Calling Groq API (Llama 3.3)...');

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a JSON-only response assistant.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errBody = (await response.json()) as unknown;
        throw new Error(
          `Groq API error: ${response.statusText} - ${JSON.stringify(errBody)}`,
        );
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
      };
      let text = data.choices[0]?.message?.content || '{}';

      if (text.startsWith('```json')) {
        text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
      }

      return JSON.parse(text.trim()) as SynapseScenario;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Groq call failed: ${message}`);
      throw error;
    }
  }

  async generateArc(prompt: string): Promise<{ stages: SynapseScenario[] }> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not set');
    }

    this.logger.log('Calling Groq API for story arc (Llama 3.3)...');

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content:
                'You are a JSON-only response assistant. Return only valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.85,
          max_tokens: 6000,
        }),
      });

      if (!response.ok) {
        const errBody = (await response.json()) as unknown;
        throw new Error(
          `Groq API error: ${response.statusText} - ${JSON.stringify(errBody)}`,
        );
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
      };
      let text = data.choices[0]?.message?.content || '{}';

      if (text.startsWith('```json')) {
        text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
      }

      return JSON.parse(text.trim()) as { stages: SynapseScenario[] };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Groq arc generation failed: ${message}`);
      throw error;
    }
  }
}
