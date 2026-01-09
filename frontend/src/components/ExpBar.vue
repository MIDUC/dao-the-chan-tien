<template>
  <div class="exp-bar-container">
    <div class="mb-1 flex justify-between text-xs text-gray-400">
      <span>Tu vi (EXP)</span>
      <span
        :title="`${currentExp.toLocaleString(
          'vi-VN'
        )} / ${expRequired.toLocaleString('vi-VN')}`"
      >
        {{ formatNumber(currentExp) }} / {{ formatNumber(expRequired) }}
      </span>
    </div>
    <div
      class="w-full bg-gray-700 rounded-full h-2 relative overflow-hidden"
    >
      <!-- Progress bar with smooth transition -->
      <div
        ref="progressBar"
        class="bg-dao-gold h-2 rounded-full relative exp-progress-bar"
        :style="`width: ${progressPercentage}%`"
      >
        <!-- Shine effect on progress bar - only show when EXP is being updated -->
        <div
          v-if="isAnimating"
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent exp-shine"
        ></div>
      </div>

      <!-- Floating EXP gain text -->
      <TransitionGroup
        name="exp-gain"
        tag="div"
        class="absolute inset-0 pointer-events-none overflow-visible"
      >
        <div
          v-for="(gain, index) in expGains"
          :key="`${gain.id}-${index}`"
          class="exp-gain-text"
          :style="gain.style"
        >
          <span class="exp-gain-icon">✨</span> +{{
            formatNumber(gain.amount)
          }}
          EXP
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { formatNumber } from "../utils/formatNumber";

interface ExpGain {
  id: number;
  amount: number;
  style: {
    left: string;
    top: string;
  };
}

const props = defineProps<{
  exp: number;
  expRequired: number;
}>();

const emit = defineEmits<{
  expGained: [amount: number];
}>();

const currentExp = ref(props.exp);
const progressBar = ref<HTMLElement | null>(null);
const expGains = ref<ExpGain[]>([]);
const isAnimating = ref(false);
let gainIdCounter = 0;
let animationFrameId: number | null = null;

// Calculate progress percentage
const progressPercentage = computed(() => {
  if (props.expRequired <= 0) return 0;
  return Math.min((currentExp.value / props.expRequired) * 100, 100);
});

// Watch for EXP changes and animate
watch(
  () => props.exp,
  (newExp, oldExp) => {
    if (oldExp !== undefined && newExp > oldExp) {
      const gainAmount = newExp - oldExp;
      animateExpGain(gainAmount);
      animateExpUpdate(newExp, oldExp);
    } else {
      // Direct update without animation (initial load)
      currentExp.value = newExp;
    }
  },
  { immediate: true }
);

// Animate EXP number update
const animateExpUpdate = (targetExp: number, startExp: number) => {
  // Cancel any existing animation
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }

  const duration = 500; // 500ms
  const startTime = Date.now();
  const difference = targetExp - startExp;
  isAnimating.value = true;

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic for smooth animation
    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    currentExp.value = Math.floor(startExp + difference * easeOutCubic);

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      currentExp.value = targetExp;
      isAnimating.value = false;
      animationFrameId = null;
    }
  };

  animationFrameId = requestAnimationFrame(animate);
};

// Animate floating EXP gain text
const animateExpGain = (amount: number) => {
  if (!progressBar.value) return;

  const rect = progressBar.value.getBoundingClientRect();
  const startY = rect.height / 2;

  const gain: ExpGain = {
    id: gainIdCounter++,
    amount,
    style: {
      left: "50%", // Center horizontally
      top: `${startY}px`,
    },
  };

  expGains.value.push(gain);
  emit("expGained", amount);

  // Remove after animation completes
  setTimeout(() => {
    const index = expGains.value.findIndex((g) => g.id === gain.id);
    if (index > -1) {
      expGains.value.splice(index, 1);
    }
  }, 2500);
};
</script>

<style scoped>
.exp-bar-container {
  position: relative;
  /* Prevent layout shifts */
  contain: layout style paint;
}

/* Optimized progress bar transition */
.exp-progress-bar {
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: width;
  /* Use GPU acceleration */
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Shine animation - only when animating */
@keyframes shine {
  0% {
    transform: translateX(-100%) translateZ(0);
  }
  100% {
    transform: translateX(100%) translateZ(0);
  }
}

.exp-shine {
  animation: shine 1s ease-out;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* EXP gain text animation - enhanced floating effect */
.exp-gain-text {
  position: absolute;
  color: #fbbf24;
  font-weight: bold;
  font-size: 0.875rem;
  text-shadow: 0 0 10px rgba(251, 191, 36, 1), 0 0 20px rgba(251, 191, 36, 0.8),
    0 0 30px rgba(251, 191, 36, 0.6), 0 2px 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
  will-change: transform, opacity;
  transform: translateX(-50%) translateZ(0);
  backface-visibility: hidden;
  animation: floatUp 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(0) translateZ(0) scale(0.8);
    filter: blur(0px);
  }
  10% {
    opacity: 1;
    transform: translateX(-50%) translateY(-5px) translateZ(0) scale(1);
    filter: blur(0px);
  }
  30% {
    opacity: 1;
    transform: translateX(-50%) translateY(-20px) translateZ(0) scale(1.15);
    filter: blur(0px);
  }
  60% {
    opacity: 1;
    transform: translateX(-50%) translateY(-50px) translateZ(0) scale(1.1);
    filter: blur(0px);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-100px) translateZ(0) scale(0.9);
    filter: blur(2px);
  }
}

/* Transition group for exp gains */
.exp-gain-enter-active {
  transition: all 0.3s ease-out;
}

.exp-gain-leave-active {
  transition: all 0.3s ease-in;
}

.exp-gain-enter-from {
  opacity: 0;
  transform: translateY(0) scale(0.5);
}

.exp-gain-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-100px) scale(0.5);
}

.exp-gain-icon {
  display: inline-block;
  animation: sparkle 2.5s ease-in-out infinite;
  margin-right: 4px;
}

@keyframes sparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  25% {
    transform: scale(1.2) rotate(90deg);
    opacity: 0.9;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 1;
  }
  75% {
    transform: scale(1.2) rotate(270deg);
    opacity: 0.9;
  }
}
</style>
