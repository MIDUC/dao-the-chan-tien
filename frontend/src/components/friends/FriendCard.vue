<template>
  <div class="bg-gray-800 p-3 rounded-lg flex items-center justify-between">
    <div>
      <div class="font-bold text-white">Character #{{ friend.friend_character_id }}</div>
      <div class="text-xs text-gray-400">
        {{ friend.status === 'accepted' ? 'Đã chấp nhận' : 'Đang chờ' }}
      </div>
    </div>
    <div class="flex gap-2">
      <button
        v-if="friend.status === 'pending' && friend.requester_id !== characterId"
        @click="$emit('accept-friend', friend.friend_character_id)"
        class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
      >
        Chấp nhận
      </button>
      <button
        @click="$emit('remove-friend', friend.friend_character_id)"
        class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
      >
        Xóa
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Friend {
  id: number;
  character_id: number;
  friend_character_id: number;
  status: string;
  requester_id: number;
}

defineProps<{
  friend: Friend;
  characterId: number;
}>();

defineEmits<{
  'accept-friend': [friendId: number];
  'remove-friend': [friendId: number];
}>();
</script>

