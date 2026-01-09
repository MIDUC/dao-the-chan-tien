<template>
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-xl font-bold text-dao-gold">Admin Panel</h2>
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="$emit('tab-selected', tab.id)"
        class="px-3 py-1 rounded text-sm whitespace-nowrap"
        :class="
          currentTab === tab.id
            ? 'bg-dao-qi text-white'
            : 'bg-gray-800 text-gray-300'
        "
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  id: string;
  label: string;
}

defineProps<{
  tabs: Tab[];
  currentTab: string;
}>();

defineEmits<{
  'tab-selected': [tabId: string];
}>();
</script>

