<template>
  <div class="flex gap-2 mb-4">
    <button
      v-for="type in leaderboardTypes"
      :key="type.value"
      @click="$emit('type-selected', type.value)"
      class="px-4 py-2 rounded-lg text-sm"
      :class="selectedType === type.value ? 'bg-dao-qi text-white' : 'bg-gray-800 text-gray-300'"
    >
      {{ type.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface LeaderboardType {
  value: string;
  label: string;
}

defineProps<{
  leaderboardTypes: LeaderboardType[];
  selectedType: string;
}>();

defineEmits<{
  'type-selected': [type: string];
}>();
</script>

