<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-xl font-bold text-purple-400">Quản lý Người Dùng</h3>
    </div>

    <div v-if="users.length === 0" class="text-gray-400 text-center py-8">
      Chưa có user nào
    </div>
    <div
      v-for="user in users"
      :key="user.id"
      class="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
    >
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-3">
            <h3 class="font-bold text-white text-lg">{{ user.username }}</h3>
            <span class="text-sm text-gray-400">{{ user.email }}</span>
            <div class="flex gap-2">
              <span
                v-for="role in user.roles || []"
                :key="role.id"
                class="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded"
              >
                {{ role.name }}
              </span>
            </div>
          </div>

          <!-- User Info -->
          <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
            <div>
              <span class="text-gray-500">ID:</span>
              <span class="text-white ml-2">{{ user.id }}</span>
            </div>
            <div>
              <span class="text-gray-500">Tạo lúc:</span>
              <span class="text-white ml-2">{{ formatDate(user.created_at) }}</span>
            </div>
            <div>
              <span class="text-gray-500">Cập nhật:</span>
              <span class="text-white ml-2">{{ formatDate(user.updated_at) }}</span>
            </div>
          </div>

          <!-- Characters -->
          <div v-if="user.characters && user.characters.length > 0" class="mt-4 border-t border-gray-700 pt-4">
            <h4 class="text-sm font-semibold text-purple-400 mb-3">
              Nhân vật ({{ user.characters.length }})
            </h4>
            <div class="space-y-3">
              <div
                v-for="character in user.characters"
                :key="character.id"
                class="bg-gray-800/50 p-3 rounded"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <h5 class="font-semibold text-white">{{ character.display_name }}</h5>
                      <span class="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                        Realm {{ character.realm_level }}
                      </span>
                      <span class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        EXP: {{ character.exp }}
                      </span>
                    </div>
                    <div class="grid grid-cols-3 gap-2 text-xs mb-2">
                      <div>
                        <span class="text-gray-500">Lực Đạo:</span>
                        <span class="text-white ml-1">{{ character.luc_dao }}</span>
                      </div>
                      <div>
                        <span class="text-gray-500">Căn Cốt:</span>
                        <span class="text-white ml-1">{{ character.can_cot }}</span>
                      </div>
                      <div>
                        <span class="text-gray-500">Thân Pháp:</span>
                        <span class="text-white ml-1">{{ character.than_phap }}</span>
                      </div>
                      <div>
                        <span class="text-gray-500">Ngộ Tính:</span>
                        <span class="text-white ml-1">{{ character.ngo_tinh }}</span>
                      </div>
                      <div>
                        <span class="text-gray-500">Định Lực:</span>
                        <span class="text-white ml-1">{{ character.dinh_luc }}</span>
                      </div>
                    </div>
                    <div v-if="character.linh_can" class="text-xs">
                      <span class="text-gray-500">Linh Căn:</span>
                      <span class="text-purple-400 ml-1">{{ character.linh_can }}</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-2">
                      Đăng nhập lần cuối: {{ formatDate(character.last_login_at) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-400 text-sm mt-2">
            Người dùng này chưa có nhân vật
          </div>
        </div>
        <div class="flex gap-2 ml-4">
          <button
            @click="$emit('edit-user', user)"
            class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition-colors"
          >
            Sửa
          </button>
          <button
            @click="$emit('delete-user', user.id)"
            class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
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

const formatDate = (date: string | Date | null) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('vi-VN');
};
</script>

