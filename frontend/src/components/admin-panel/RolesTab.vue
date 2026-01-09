<template>
  <div class="space-y-3">
    <div v-if="roles.length === 0" class="text-gray-400 text-center py-8">
      Chưa có role nào
    </div>
    <div
      v-for="role in roles"
      :key="role.id"
      class="bg-gray-800 p-4 rounded-lg border border-gray-700"
    >
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-white">{{ role.name }}</h3>
          <p class="text-sm text-gray-400">{{ role.description }}</p>
          <p class="text-xs text-gray-500 mt-1">Priority: {{ role.priority }}</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="$emit('edit-role', role)"
            class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
          >
            Sửa
          </button>
          <button
            @click="$emit('delete-role', role.id)"
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
  roles: any[];
}>();

defineEmits<{
  'edit-role': [role: any];
  'delete-role': [roleId: number];
}>();
</script>

