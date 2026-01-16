/**
 * GameManager - Main entry point for PixiJS game
 * 
 * Manages the PixiJS application and scenes
 * Separated from Vue components for clean architecture
 * 
 * Usage in Vue component:
 * ```ts
 * import { GameManager } from '@/game/core/GameManager';
 * 
 * const gameManager = new GameManager('game-container');
 * gameManager.start();
 * ```
 */

// @ts-ignore - pixi.js not installed yet
import * as PIXI from 'pixi.js';
import { BattleScene } from '../scenes/BattleScene';

export class GameManager {
  private app: PIXI.Application | null = null;
  private currentScene: BattleScene | null = null;
  private containerId: string;

  constructor(containerId: string) {
    this.containerId = containerId;
  }

  /**
   * Initialize and start the game
   */
  async start(): Promise<void> {
    if (this.app) {
      console.warn('Game is already running');
      return;
    }

    // Create PixiJS application
    this.app = new PIXI.Application();

    // Initialize the application
    await this.app.init({
      width: 800,
      height: 600,
      backgroundColor: 0x1a1a2e, // Dark blue background
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Append canvas to container
    const container = document.getElementById(this.containerId);
    if (!container) {
      throw new Error(`Container with id "${this.containerId}" not found`);
    }
    container.appendChild(this.app.canvas);

    // Create and start battle scene
    this.currentScene = new BattleScene(this.app);
    this.currentScene.start();

    // Start game loop
    this.app.ticker.add(() => {
      if (this.currentScene) {
        this.currentScene.update(this.app.ticker.deltaMS);
      }
    });

    console.log('Game started successfully');
  }

  /**
   * Stop and destroy the game
   */
  destroy(): void {
    if (this.currentScene) {
      this.currentScene.destroy();
      this.currentScene = null;
    }

    if (this.app) {
      this.app.destroy(true);
      this.app = null;
    }
  }

  /**
   * Get the PixiJS application instance
   */
  getApp(): PIXI.Application | null {
    return this.app;
  }

  /**
   * Get current scene
   */
  getCurrentScene(): BattleScene | null {
    return this.currentScene;
  }
}

