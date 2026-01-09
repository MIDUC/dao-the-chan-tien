<template>
  <div class="space-y-3">
    <div v-if="items.length === 0" class="text-gray-400 text-center py-8">
      Chưa có item nào
    </div>
    <div
      v-for="item in items"
      :key="item.id"
      class="bg-gray-800 p-4 rounded-lg border border-gray-700"
    >
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-white">{{ item.name }}</h3>
          <p class="text-sm text-gray-400">{{ item.description }}</p>
          <div class="flex gap-2 mt-2">
            <span
              class="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded"
            >
              {{ item.item_type }}
            </span>
            <span
              class="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded"
            >
              Grade {{ item.grade }}
            </span>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="$emit('edit-item', item)"
            class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
          >
            Sửa
          </button>
          <button
            @click="$emit('delete-item', item.id)"
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
  items: any[];
}>();

defineEmits<{
  'edit-item': [item: any];
  'delete-item': [itemId: number];
}>();
</script>

