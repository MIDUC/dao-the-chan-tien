<template>
  <div
    class="bg-gray-950/90 backdrop-blur-sm border-b border-gray-700/50 px-2 sm:px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2"
  >
    <h1 class="text-base sm:text-lg font-bold text-purple-400">
      Đạo Thể Chân Tiên
    </h1>
    <div
      class="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide w-full sm:w-auto"
    >
      <button
        v-for="view in quickViews"
        :key="view.id"
        @click="$emit('switch-view', view.id)"
        class="px-2 sm:px-3 py-1 rounded text-xs transition-all whitespace-nowrap flex-shrink-0"
        :class="
          view.active
            ? 'bg-purple-600 text-white'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        "
      >
        <span class="hidden sm:inline">{{ view.icon }} </span>{{ view.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface QuickView {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}

defineProps<{
  quickViews: QuickView[];
}>();

defineEmits<{
  'switch-view': [viewId: string];
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

