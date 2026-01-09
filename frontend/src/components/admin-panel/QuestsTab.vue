<template>
  <div class="space-y-3">
    <div v-if="quests.length === 0" class="text-gray-400 text-center py-8">
      Chưa có quest nào
    </div>
    <div
      v-for="quest in quests"
      :key="quest.id"
      class="bg-gray-800 p-4 rounded-lg border border-gray-700"
    >
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-white">{{ quest.title }}</h3>
          <p class="text-sm text-gray-400">{{ quest.description }}</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="$emit('edit-quest', quest)"
            class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
          >
            Sửa
          </button>
          <button
            @click="$emit('delete-quest', quest.id)"
            class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  quests: any[];
}>();

defineEmits<{
  'edit-quest': [quest: any];
  'delete-quest': [questId: number];
}>();
</script>

