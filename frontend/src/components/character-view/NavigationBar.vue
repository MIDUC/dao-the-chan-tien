<template>
  <div
    class="bg-gray-900/80 border-b border-gray-700/50 px-2 sm:px-4 py-2 overflow-x-auto scrollbar-hide"
  >
    <div class="flex gap-1 sm:gap-2 min-w-max">
      <button
        v-for="tab in mainTabs"
        :key="tab.id"
        class="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
        :class="
          activeMainTab === tab.id
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        "
      >
        {{ tab.label }}
        <span
          v-if="tab.tag"
          class="hidden sm:inline ml-2 text-xs bg-yellow-500/30 text-yellow-400 px-1.5 py-0.5 rounded"
        >
          {{ tab.tag }}
        </span>
      </button>
    </div>

    <!-- Sub Categories -->
    <div class="flex gap-1 sm:gap-2 mt-2 overflow-x-auto scrollbar-hide">
      <button
        v-for="category in subCategories"
        :key="category"
        class="px-2 sm:px-3 py-1 rounded text-xs whitespace-nowrap flex-shrink-0"
        :class="
          activeCategory === category
            ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
            : 'text-gray-400 hover:text-gray-300'
        "
      >
        {{ category }}
      </button>
    </div>

    <!-- Circular Action Buttons -->
    <div class="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3 flex-wrap">
      <button
        v-for="action in actionButtons"
        :key="action.id"
        class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl transition-all hover:scale-110 flex-shrink-0"
        :class="
          action.highlight
            ? 'bg-green-500/30 border-2 border-green-400 text-green-300'
            : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600'
        "
        :title="action.label"
      >
        {{ action.icon }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MainTab {
  id: string;
  label: string;
  tag?: string;
}

interface ActionButton {
  id: string;
  label: string;
  icon: string;
  highlight?: boolean;
}

defineProps<{
  mainTabs: MainTab[];
  subCategories: string[];
  actionButtons: ActionButton[];
  activeMainTab: string;
  activeCategory: string;
}>();
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>

