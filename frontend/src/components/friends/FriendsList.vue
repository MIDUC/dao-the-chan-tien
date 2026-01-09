<template>
  <div class="w-full">
    <h2 class="text-xl font-bold mb-4 text-dao-gold">Bạn Bè</h2>

    <FriendsTabs
      :selected-tab="selectedTab"
      :pending-count="pendingCount"
      @tab-selected="selectedTab = $event"
    />

    <div v-if="loading" class="text-gray-400 animate-pulse">Đang tải...</div>

    <div v-else class="space-y-2">
      <FriendCard
        v-for="friend in displayedFriends"
        :key="friend.id"
        :friend="friend"
        :character-id="characterId"
        @accept-friend="handleAcceptFriend"
        @remove-friend="handleRemoveFriend"
      />

      <div v-if="displayedFriends.length === 0" class="text-gray-400 text-center py-8">
        {{ selectedTab === 'friends' ? 'Chưa có bạn bè' : 'Không có lời mời' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '../../composables/useApi';
import FriendsTabs from './FriendsTabs.vue';
import FriendCard from './FriendCard.vue';

interface Friend {
  id: number;
  character_id: number;
  friend_character_id: number;
  status: string;
  requester_id: number;
}

const props = defineProps<{
  characterId: number;
}>();

const friends = ref<Friend[]>([]);
const selectedTab = ref<'friends' | 'pending'>('friends');
const loading = ref(true);

const displayedFriends = computed(() => {
  if (selectedTab.value === 'friends') {
    return friends.value.filter((f) => f.status === 'accepted');
  } else {
    return friends.value.filter((f) => f.status === 'pending');
  }
});

const pendingCount = computed(() => {
  return friends.value.filter((f) => f.status === 'pending').length;
});

const fetchFriends = async () => {
  try {
    const response = await api.get(`/friends/character/${props.characterId}`);
    friends.value = response.data;
  } catch (error) {
    console.error('Error fetching friends:', error);
  } finally {
    loading.value = false;
  }
};

const handleAcceptFriend = async (friendId: number) => {
  try {
    await api.post('/friends/accept', {
      characterId: props.characterId,
      friendId,
    });
    await fetchFriends();
  } catch (error) {
    console.error('Error accepting friend:', error);
  }
};

const handleRemoveFriend = async (friendId: number) => {
  try {
    await api.post('/friends/remove', {
      characterId: props.characterId,
      friendId,
    });
    await fetchFriends();
  } catch (error) {
    console.error('Error removing friend:', error);
  }
};

onMounted(() => {
  fetchFriends();
});
</script>

