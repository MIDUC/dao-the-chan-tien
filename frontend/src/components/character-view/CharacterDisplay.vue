<template>
  <div class="relative mb-1">
    <div class="flex flex-col items-center justify-center">
      <!-- Main Character -->
      <div
        class="relative w-full flex items-center justify-center"
        style="min-height: 200px"
      >
        <div class="relative w-full flex flex-col items-center">
          <img
            :src="characterImage"
            alt="Character"
            class="w-full h-auto object-contain filter drop-shadow-2xl max-h-[200px] mx-auto block"
            style="pointer-events: none"
          />
          <!-- Glowing particles effect -->
          <div class="absolute inset-0 pointer-events-none">
            <div
              v-for="i in 20"
              :key="i"
              class="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
              :style="{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 2 + 's',
                opacity: Math.random() * 0.5 + 0.3,
              }"
            ></div>
          </div>
        </div>

        <!-- Circular Breakthrough Button - Overlay on Character Center -->
        <div
          v-if="canBreakthrough"
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 opacity-60 hover:opacity-90 transition-opacity duration-300"
          style="pointer-events: auto"
        >
          <button
            @click="$emit('open-breakthrough')"
            class="relative w-12 h-12 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 group flex flex-col items-center justify-center"
            style="pointer-events: auto"
          >
            <!-- Glow effect - Blue/Cyan -->
            <div
              class="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 blur-lg group-hover:blur-xl transition-all duration-300"
            ></div>

            <!-- Background gradient - Blue/Cyan misty -->
            <div
              class="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/40 via-blue-500/40 to-blue-600/40 backdrop-blur-sm border border-cyan-300/30 group-hover:border-cyan-200/50 transition-all"
            ></div>

            <!-- Shine effect on hover -->
            <div
              class="absolute inset-0 rounded-full bg-white/0 group-hover:bg-cyan-200/20 transition-all duration-500"
            ></div>

            <!-- Text -->
            <span
              class="relative z-10 text-center leading-tight font-semibold drop-shadow-lg text-cyan-100"
            >
              Đột<br />Phá
            </span>

            <!-- Pulse animation - Blue/Cyan -->
            <div
              class="absolute inset-0 rounded-full border border-cyan-300/40 animate-pulse"
            ></div>
          </button>
        </div>
      </div>

      <!-- Cultivation Status Text - Below character's feet -->
      <div class="mt-1 text-center w-full">
        <div class="text-xs text-gray-300">
          Đang nhập định, vận chuyển huyền công theo chu thiên...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import characterImageSrc from "../../assets/nhanvatngoithien1-removebg-preview.png";

const characterImage = characterImageSrc;

const props = defineProps<{
  canBreakthrough?: boolean;
}>();

defineEmits<{
  "open-breakthrough": [];
}>();
</script>
