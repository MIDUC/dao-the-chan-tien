/**
 * CharacterSprite - Represents a character in the game
 * 
 * Handles character rendering, animation, and movement
 */

// @ts-ignore - pixi.js not installed yet
import * as PIXI from 'pixi.js';

export interface CharacterSpriteOptions {
  id: number;
  x: number;
  y: number;
  name: string;
  spriteUrl?: string;
}

export class CharacterSprite {
  private id: number;
  private sprite: PIXI.Sprite | PIXI.Container;
  private x: number;
  private y: number;
  private healthBar: PIXI.Graphics | null = null;

  constructor(options: CharacterSpriteOptions) {
    this.id = options.id;
    this.x = options.x;
    this.y = options.y;
    // name stored but not used currently

    // Create sprite
    if (options.spriteUrl) {
      this.sprite = PIXI.Sprite.from(options.spriteUrl);
    } else {
      // Placeholder: Create a colored rectangle
      const graphics = new PIXI.Graphics();
      graphics.rect(0, 0, 50, 50);
      graphics.fill(0x4a90e2); // Blue color
      this.sprite = graphics;
    }

    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.anchor.set(0.5);

    // Create health bar
    this.createHealthBar();
  }

  /**
   * Create health bar above character
   */
  private createHealthBar(): void {
    const barWidth = 60;
    const barHeight = 6;
    const barY = -40;

    // Background (red)
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, barWidth, barHeight);
    bg.fill(0xff0000);
    bg.x = -barWidth / 2;
    bg.y = barY;

    // Health (green) - placeholder, will be updated based on actual HP
    const health = new PIXI.Graphics();
    health.rect(0, 0, barWidth, barHeight);
    health.fill(0x00ff00);
    health.x = -barWidth / 2;
    health.y = barY;

    this.healthBar = new PIXI.Container();
    this.healthBar.addChild(bg);
    this.healthBar.addChild(health);
    this.sprite.addChild(this.healthBar);
  }

  /**
   * Update health bar
   */
  updateHealth(currentHp: number, maxHp: number): void {
    if (!this.healthBar) return;

    const healthBar = this.healthBar.children[1] as PIXI.Graphics;
    const percentage = Math.max(0, Math.min(1, currentHp / maxHp));
    const barWidth = 60;

    healthBar.clear();
    healthBar.rect(0, 0, barWidth * percentage, 6);
    healthBar.fill(0x00ff00);
  }

  /**
   * Move character to position
   */
  moveTo(x: number, y: number, duration: number = 500): void {
    // Simple linear interpolation
    // In production, use a tweening library like gsap
    this.x = x;
    this.y = y;

    // Animate movement
    const startX = this.sprite.x;
    const startY = this.sprite.y;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);

      this.sprite.x = startX + (x - startX) * progress;
      this.sprite.y = startY + (y - startY) * progress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Play attack animation
   */
  playAttackAnimation(): void {
    // Simple scale animation
    const originalScale = this.sprite.scale.x;
    this.sprite.scale.set(originalScale * 1.2);

    setTimeout(() => {
      this.sprite.scale.set(originalScale);
    }, 200);
  }

  /**
   * Update character (called every frame)
   */
  update(_deltaTime: number): void {
    // Update animations, effects, etc.
  }

  /**
   * Get sprite
   */
  getSprite(): PIXI.Sprite | PIXI.Container {
    return this.sprite;
  }

  /**
   * Get character ID
   */
  getId(): number {
    return this.id;
  }

  /**
   * Destroy character
   */
  destroy(): void {
    if (this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
    this.sprite.destroy();
  }
}

