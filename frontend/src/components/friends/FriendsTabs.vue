<template>
  <div class="flex gap-2 mb-4">
    <button
      @click="$emit('tab-selected', 'friends')"
      class="px-4 py-2 rounded-lg"
      :class="selectedTab === 'friends' ? 'bg-dao-qi text-white' : 'bg-gray-800 text-gray-300'"
    >
      Bạn bè
    </button>
    <button
      @click="$emit('tab-selected', 'pending')"
      class="px-4 py-2 rounded-lg"
      :class="selectedTab === 'pending' ? 'bg-dao-qi text-white' : 'bg-gray-800 text-gray-300'"
    >
      Đang chờ ({{ pendingCount }})
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  selectedTab: 'friends' | 'pending';
  pendingCount: number;
}>();

defineEmits<{
  'tab-selected': [tab: 'friends' | 'pending'];
}>();
</script>

