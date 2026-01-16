/**
 * SkillEffect - Represents a skill effect (fireball, sword slash, etc.)
 * 
 * Handles particle effects and animations for skills
 */

// @ts-ignore - pixi.js not installed yet
import * as PIXI from 'pixi.js';

export interface SkillEffectOptions {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  type: 'fireball' | 'slash' | 'heal' | 'explosion';
  duration?: number;
}

export class SkillEffect {
  private container: PIXI.Container;
  private type: string;
  private startX: number;
  private startY: number;
  private targetX: number;
  private targetY: number;
  private duration: number;
  private elapsed: number = 0;
  private finished: boolean = false;

  constructor(options: SkillEffectOptions) {
    this.type = options.type;
    this.startX = options.x;
    this.startY = options.y;
    this.targetX = options.targetX;
    this.targetY = options.targetY;
    this.duration = options.duration || 1000;

    this.container = new PIXI.Container();
    this.container.x = this.startX;
    this.container.y = this.startY;

    this.createEffect();
  }

  /**
   * Create visual effect based on type
   */
  private createEffect(): void {
    switch (this.type) {
      case 'fireball':
        this.createFireball();
        break;
      case 'slash':
        this.createSlash();
        break;
      case 'heal':
        this.createHeal();
        break;
      case 'explosion':
        this.createExplosion();
        break;
    }
  }

  /**
   * Create fireball effect
   */
  private createFireball(): void {
    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, 20);
    graphics.fill(0xff6600); // Orange fire color

    // Add glow effect
    const glow = new PIXI.Graphics();
    glow.circle(0, 0, 25);
    glow.fill({ color: 0xff9900, alpha: 0.5 });

    this.container.addChild(glow);
    this.container.addChild(graphics);
  }

  /**
   * Create slash effect
   */
  private createSlash(): void {
    const graphics = new PIXI.Graphics();
    // Create a curved slash shape
    graphics.moveTo(-20, -10);
    graphics.lineTo(20, 10);
    graphics.lineTo(10, 20);
    graphics.lineTo(-10, 0);
    graphics.closePath();
    graphics.fill(0xffffff); // White slash

    this.container.addChild(graphics);
  }

  /**
   * Create heal effect
   */
  private createHeal(): void {
    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, 15);
    graphics.fill(0x00ff00); // Green heal

    this.container.addChild(graphics);
  }

  /**
   * Create explosion effect
   */
  private createExplosion(): void {
    // Create multiple particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const graphics = new PIXI.Graphics();
      graphics.circle(0, 0, 5);
      graphics.fill(0xff0000); // Red particles

      graphics.x = Math.cos(angle) * 30;
      graphics.y = Math.sin(angle) * 30;

      this.container.addChild(graphics);
    }
  }

  /**
   * Update effect (called every frame)
   */
  update(deltaTime: number): void {
    if (this.finished) return;

    this.elapsed += deltaTime;
    const progress = Math.min(1, this.elapsed / this.duration);

    // Move effect from start to target
    this.container.x = this.startX + (this.targetX - this.startX) * progress;
    this.container.y = this.startY + (this.targetY - this.startY) * progress;

    // Fade out near the end
    if (progress > 0.7) {
      this.container.alpha = 1 - (progress - 0.7) / 0.3;
    }

    // Mark as finished
    if (progress >= 1) {
      this.finished = true;
    }
  }

  /**
   * Check if effect is finished
   */
  isFinished(): boolean {
    return this.finished;
  }

  /**
   * Get container
   */
  getContainer(): PIXI.Container {
    return this.container;
  }

  /**
   * Destroy effect
   */
  destroy(): void {
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy();
  }
}

