<template>
  <div class="space-y-3">
    <div v-if="npcs.length === 0" class="text-gray-400 text-center py-8">
      Chưa có NPC nào
    </div>
    <div
      v-for="npc in npcs"
      :key="npc.id"
      class="bg-gray-800 p-4 rounded-lg border border-gray-700"
    >
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-white">{{ npc.name }}</h3>
          <p class="text-sm text-gray-400">{{ npc.description }}</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="$emit('edit-npc', npc)"
            class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
          >
            Sửa
          </button>
          <button
            @click="$emit('delete-npc', npc.id)"
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
  npcs: any[];
}>();

defineEmits<{
  'edit-npc': [npc: any];
  'delete-npc': [npcId: number];
}>();
</script>

