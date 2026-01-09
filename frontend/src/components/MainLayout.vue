<template>
  <div class="main-layout-wrapper bg-gray-900 min-h-screen min-h-[100dvh]">
    <!-- Background Layer -->
    <div
      class="fixed inset-0 z-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
    >
      <!-- Optional: Add background image here if needed -->
      <!-- <img src="/path/to/background.jpg" alt="" class="w-full h-full object-cover opacity-20" /> -->
    </div>

    <!-- Content Container (Mobile-First: max-w-480px, Desktop: same ratio, centered) -->
    <div
      class="relative z-10 w-full max-w-[480px] mx-auto h-screen h-[100dvh] max-h-screen max-h-[100dvh] overflow-hidden bg-gray-900/95 backdrop-blur-sm"
    >
      <!-- Inner Flex Structure -->
      <div class="flex flex-col h-full">
        <!-- Section A: Header (Top) -->
        <div
          class="flex-shrink-0 z-50 backdrop-blur-md bg-black/60 border-b border-purple-500/30"
        >
          <slot name="header" />
        </div>

        <!-- Section B: Main Content (Middle) -->
        <div
          class="flex-1 overflow-y-auto scrollbar-hide relative z-10"
          style="scrollbar-width: none; -ms-overflow-style: none;"
        >
          <slot />
        </div>

        <!-- Section C: Footer Area (Bottom) -->
        <div
          class="flex-shrink-0 z-50 backdrop-blur-md bg-black/60 border-t border-purple-500/30"
          style="padding-bottom: env(safe-area-inset-bottom);"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// MainLayout component - Mobile-first responsive layout
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Ensure proper height on mobile browsers */
.main-layout-wrapper {
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile */
}
</style>

