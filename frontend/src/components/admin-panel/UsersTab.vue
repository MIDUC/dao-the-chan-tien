<template>
  <div class="space-y-3">
    <div v-if="users.length === 0" class="text-gray-400 text-center py-8">
      Chưa có user nào
    </div>
    <div
      v-for="user in users"
      :key="user.id"
      class="bg-gray-800 p-4 rounded-lg border border-gray-700"
    >
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-white">{{ user.username }}</h3>
          <p class="text-sm text-gray-400">{{ user.email }}</p>
          <div class="flex gap-2 mt-2">
            <span
              v-for="role in user.roles"
              :key="role.id"
              class="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded"
            >
              {{ role.name }}
            </span>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="$emit('edit-user', user)"
            class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
          >
            Sửa
          </button>
          <button
            @click="$emit('delete-user', user.id)"
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
  users: any[];
}>();

defineEmits<{
  'edit-user': [user: any];
  'delete-user': [userId: number];
}>();
</script>

