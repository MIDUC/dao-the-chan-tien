# Game Logic (PixiJS)

This folder contains all PixiJS game logic, separated from Vue UI components.

## Architecture

### Hybrid Game Structure
- **UI Layer (DOM)**: Vue 3 + Tailwind - Displays stats, buttons, logs
- **Game Layer (Canvas)**: PixiJS - Renders characters, skill effects, animations

## Structure

```
game/
├── core/
│   └── GameManager.ts       # Main game manager
├── scenes/
│   └── BattleScene.ts       # Battle scene
├── entities/
│   └── CharacterSprite.ts   # Character rendering
├── effects/
│   └── SkillEffect.ts       # Skill effects (fireball, slash, etc.)
├── utils/
│   └── collision.ts         # Collision detection
└── README.md                # This file
```

## Dependencies

Install PixiJS:
```bash
npm install pixi.js
```

For particle effects (optional):
```bash
npm install @pixi/particle-emitter
```

## Usage

### In Vue Component

```vue
<template>
  <div class="game-container">
    <!-- UI Layer (Vue) -->
    <div class="ui-overlay">
      <div>HP: {{ characterHp }}</div>
      <button @click="useSkill">Use Skill</button>
    </div>
    
    <!-- Game Layer (PixiJS Canvas) -->
    <div id="game-canvas"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { GameManager } from '@/game/core/GameManager';

let gameManager: GameManager | null = null;

onMounted(() => {
  gameManager = new GameManager('game-canvas');
  gameManager.start();
});

onUnmounted(() => {
  gameManager?.destroy();
});
</script>

<style scoped>
.game-container {
  position: relative;
  width: 800px;
  height: 600px;
}

.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10; /* Above canvas */
  pointer-events: none; /* Allow clicks to pass through to canvas */
}

#game-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1; /* Below UI */
}
</style>
```

## Best Practices

1. **Never import Vue components in game logic**
   - Game logic should be framework-agnostic
   - Use events or callbacks to communicate with Vue

2. **Separate concerns**
   - Game logic: `game/` folder
   - UI components: `components/` folder
   - Communication: Use events or composables

3. **Performance**
   - Use object pooling for frequently created/destroyed objects
   - Limit particle count for mobile devices
   - Use texture atlases for sprites

4. **Multiplayer**
   - Client-side rendering only
   - Server validates all actions
   - Use WebSocket for real-time sync (Colyseus recommended)

## Collision Detection

Simple collision detection is provided in `utils/collision.ts`:
- Rectangle-Rectangle (AABB)
- Circle-Circle
- Point-Rectangle
- Point-Circle
- Distance checks

For complex physics, consider Planck.js or Matter.js (but not recommended for Tu Tien game).
