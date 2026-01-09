<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-dao-gold">Thông Báo</h2>
      <div class="flex gap-2">
        <button
          v-if="unreadCount > 0"
          @click="handleMarkAllAsRead"
          class="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
        >
          Đọc tất cả
        </button>
        <span
          v-if="unreadCount > 0"
          class="bg-red-500 text-white text-xs px-2 py-1 rounded-full"
        >
          {{ unreadCount }}
        </span>
      </div>
    </div>

    <div v-if="loading" class="text-gray-400 animate-pulse">Đang tải...</div>

    <div v-else class="space-y-2">
      <NotificationCard
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        @mark-as-read="handleMarkAsRead"
        @delete-notification="handleDeleteNotification"
      />

      <div v-if="notifications.length === 0" class="text-gray-400 text-center py-8">
        Không có thông báo
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../composables/useApi';
import NotificationCard from './NotificationCard.vue';

interface Notification {
  id: number;
  character_id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const props = defineProps<{
  characterId: number;
}>();

const notifications = ref<Notification[]>([]);
const unreadCount = ref(0);
const loading = ref(true);

const fetchNotifications = async () => {
  try {
    const [notificationsRes, countRes] = await Promise.all([
      api.get(`/notifications/character/${props.characterId}`),
      api.get(`/notifications/character/${props.characterId}/unread-count`),
    ]);
    notifications.value = notificationsRes.data;
    unreadCount.value = countRes.data.count;
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    loading.value = false;
  }
};

const handleMarkAsRead = async (id: number) => {
  try {
    await api.post(`/notifications/read/${id}`, {
      characterId: props.characterId,
    });
    await fetchNotifications();
  } catch (error) {
    console.error('Error marking as read:', error);
  }
};

const handleMarkAllAsRead = async () => {
  try {
    await api.post('/notifications/read-all', {
      characterId: props.characterId,
    });
    await fetchNotifications();
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};

const handleDeleteNotification = async (id: number) => {
  try {
    await api.delete(`/notifications/${id}`, {
      data: { characterId: props.characterId },
    });
    await fetchNotifications();
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};

onMounted(() => {
  fetchNotifications();
});
</script>

