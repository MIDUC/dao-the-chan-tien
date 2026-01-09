<template>
  <div
    class="bg-gray-800 p-3 rounded-lg border"
    :class="notification.is_read ? 'border-gray-700' : 'border-blue-500'"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <h3 class="font-bold text-white">{{ notification.title }}</h3>
          <span
            v-if="!notification.is_read"
            class="bg-blue-500 w-2 h-2 rounded-full"
          ></span>
        </div>
        <p class="text-sm text-gray-400">{{ notification.message }}</p>
        <div class="text-xs text-gray-500 mt-1">
          {{ formatDate(notification.created_at) }}
        </div>
      </div>
      <div class="flex gap-2">
        <button
          v-if="!notification.is_read"
          @click="$emit('mark-as-read', notification.id)"
          class="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
        >
          Đọc
        </button>
        <button
          @click="$emit('delete-notification', notification.id)"
          class="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
        >
          Xóa
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Notification {
  id: number;
  character_id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

defineProps<{
  notification: Notification;
}>();

defineEmits<{
  'mark-as-read': [id: number];
  'delete-notification': [id: number];
}>();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
};
</script>

