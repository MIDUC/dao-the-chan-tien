/**
 * BattleScene - Main battle scene
 * 
 * Handles real-time combat rendering with PixiJS
 * Displays characters, skills, and effects
 */

// @ts-ignore - pixi.js not installed yet
import * as PIXI from 'pixi.js';
import { CharacterSprite } from '../entities/CharacterSprite';
import { SkillEffect } from '../effects/SkillEffect';

export class BattleScene {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private characters: Map<number, CharacterSprite> = new Map();
  private effects: SkillEffect[] = [];

  constructor(app: PIXI.Application) {
    this.app = app;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);
  }

  /**
   * Start the scene
   */
  start(): void {
    // Setup background
    this.setupBackground();

    // Setup initial characters (placeholder)
    this.setupCharacters();

    console.log('Battle scene started');
  }

  /**
   * Update scene (called every frame)
   */
  update(deltaTime: number): void {
    // Update characters
    for (const character of this.characters.values()) {
      character.update(deltaTime);
    }

    // Update effects
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const effect = this.effects[i];
      if (!effect) continue;
      effect.update(deltaTime);

      // Remove finished effects
      if (effect.isFinished()) {
        effect.destroy();
        this.effects.splice(i, 1);
      }
    }
  }

  /**
   * Setup background
   */
  private setupBackground(): void {
    // Create gradient background or use a sprite
    const graphics = new PIXI.Graphics();
    graphics.rect(0, 0, this.app.screen.width, this.app.screen.height);
    graphics.fill(0x1a1a2e); // Dark blue
    this.container.addChild(graphics);
  }

  /**
   * Setup initial characters
   */
  private setupCharacters(): void {
    // Placeholder: Add player character
    // In real implementation, load from API
    const player = new CharacterSprite({
      id: 1,
      x: 200,
      y: 300,
      name: 'Player',
    });
    this.addCharacter(player);

    // Placeholder: Add enemy character
    const enemy = new CharacterSprite({
      id: 2,
      x: 600,
      y: 300,
      name: 'Enemy',
    });
    this.addCharacter(enemy);
  }

  /**
   * Add character to scene
   */
  addCharacter(character: CharacterSprite): void {
    this.characters.set(character.getId(), character);
    this.container.addChild(character.getSprite());
  }

  /**
   * Remove character from scene
   */
  removeCharacter(characterId: number): void {
    const character = this.characters.get(characterId);
    if (character) {
      character.destroy();
      this.characters.delete(characterId);
    }
  }

  /**
   * Add skill effect
   */
  addEffect(effect: SkillEffect): void {
    this.effects.push(effect);
    this.container.addChild(effect.getContainer());
  }

  /**
   * Destroy scene
   */
  destroy(): void {
    // Clean up characters
    for (const character of this.characters.values()) {
      character.destroy();
    }
    this.characters.clear();

    // Clean up effects
    for (const effect of this.effects) {
      effect.destroy();
    }
    this.effects = [];

    // Remove container
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy();
  }
}

