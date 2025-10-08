/**
 * Base class for Stagehand-powered browser automation
 * Provides common functionality for all browser automation services
 */

import { Stagehand } from "@browserbasehq/stagehand";

export interface StagehandConfig {
  apiKey?: string;
  projectId?: string;
  modelName?: string;
  modelClientOptions?: {
    apiKey?: string;
  };
  verbose?: 0 | 1 | 2;
  domSettleTimeoutMs?: number;
}

export abstract class BaseStagehandService {
  protected stagehand: Stagehand | null = null;
  protected page: any = null; // Stagehand page with extended methods
  protected sessionId: string | null = null;

  /**
   * Initialize Stagehand session
   */
  async initSession(config?: Partial<StagehandConfig>): Promise<void> {
    const defaultConfig: StagehandConfig = {
      apiKey: process.env.BROWSERBASE_API_KEY,
      projectId: process.env.BROWSERBASE_PROJECT_ID,
      modelName: process.env.ANTHROPIC_API_KEY ? "claude-3-5-sonnet-latest" : "gpt-4o",
      modelClientOptions: {
        apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY,
      },
      verbose: 0,
      domSettleTimeoutMs: 30000,
    };

    const finalConfig = { ...defaultConfig, ...config };

    this.stagehand = new Stagehand({
      env: "BROWSERBASE",
      apiKey: finalConfig.apiKey,
      projectId: finalConfig.projectId,
      modelName: finalConfig.modelName as any,
      modelClientOptions: finalConfig.modelClientOptions,
      verbose: finalConfig.verbose,
      domSettleTimeoutMs: finalConfig.domSettleTimeoutMs,
    });

    await this.stagehand.init();
    this.page = this.stagehand.page;

    // Get session ID for tracking
    this.sessionId = (this.stagehand as any).browserbaseSessionID || null;
  }

  /**
   * Navigate to a URL
   */
  async navigate(url: string): Promise<void> {
    if (!this.page) {
      throw new Error("Stagehand session not initialized");
    }

    await this.page.goto(url);
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(): Promise<Buffer> {
    if (!this.page) {
      throw new Error("Stagehand session not initialized");
    }

    return await this.page.screenshot({
      fullPage: false
    });
  }

  /**
   * Wait for a specific timeout
   */
  async wait(ms: number): Promise<void> {
    if (!this.page) {
      throw new Error("Stagehand session not initialized");
    }

    await this.page.waitForTimeout(ms);
  }

  /**
   * Close the session
   */
  async close(): Promise<void> {
    if (this.stagehand) {
      await this.stagehand.close();
      this.stagehand = null;
      this.page = null;
      this.sessionId = null;
    }
  }

  /**
   * Get session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Check if session is active
   */
  isSessionActive(): boolean {
    return this.stagehand !== null && this.page !== null;
  }
}

