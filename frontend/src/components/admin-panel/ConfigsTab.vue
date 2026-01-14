<template>
  <div class="space-y-4">
    <div
      class="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 bg-yellow-500/20 rounded-lg">
          <span class="text-2xl">⚙️</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-dao-gold">Cấu Hình Hệ Thống</h3>
          <p class="text-xs text-gray-400 mt-1">
            Quản lý các tham số cấu hình toàn hệ thống
          </p>
        </div>
      </div>
      <div
        class="text-xs text-gray-400 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700/50"
      >
        <span class="text-yellow-500/70">💡</span> Để thêm config mới, vui
        lòng thêm trực tiếp vào database
      </div>
    </div>

    <div
      v-if="systemConfigs.length === 0"
      class="text-gray-400 text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50"
    >
      <div class="flex flex-col items-center gap-3">
        <span class="text-4xl opacity-50">📋</span>
        <p class="text-sm font-medium">Chưa có config nào</p>
        <p class="text-xs text-gray-500">
          Chạy
          <code class="bg-gray-700 px-2 py-1 rounded">npm run seed</code> để
          tạo configs mặc định
        </p>
      </div>
    </div>

    <!-- Config Table -->
    <div
      v-else
      class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700/50 overflow-hidden shadow-2xl"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead
            class="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700/50"
          >
            <tr>
              <th
                class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider"
              >
                Key
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider"
              >
                Value
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider"
              >
                Mô tả
              </th>
              <th
                class="px-6 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider"
              >
                Active
              </th>
              <th
                class="px-6 py-4 text-center text-xs font-bold text-gray-300 uppercase tracking-wider"
              >
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700/30">
            <tr
              v-for="config in systemConfigs"
              :key="config.key"
              class="border-t border-gray-700/30 hover:bg-gray-750/50 transition-all duration-200 group"
            >
              <!-- Key (read-only) -->
              <td class="px-6 py-4">
                <div
                  class="font-mono text-sm font-semibold text-dao-gold flex items-center gap-2"
                >
                  <span class="text-yellow-500/50">⚙️</span>
                  <span>{{ config.key }}</span>
                </div>
              </td>

              <!-- Value (editable) -->
              <td class="px-6 py-4">
                <div
                  v-if="editingConfig?.key !== config.key"
                  class="font-mono text-sm font-semibold text-yellow-400 cursor-pointer hover:text-yellow-300 transition-all duration-200 px-3 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 hover:border-yellow-500/40 group-hover:scale-105"
                  @click="$emit('start-edit', config)"
                  title="Click để sửa"
                >
                  <span class="flex items-center gap-2">
                    <span class="text-yellow-500/70">💎</span>
                    <span>{{ config.value }}</span>
                  </span>
                </div>
                <input
                  v-else
                  :value="editingConfig.value"
                  @input="$emit('update-editing-value', ($event.target as HTMLInputElement).value)"
                  type="text"
                  class="w-full bg-gray-700/80 text-white px-4 py-2.5 rounded-lg text-sm font-mono font-semibold border-2 border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-400 shadow-lg shadow-yellow-500/20 transition-all duration-200"
                  @keyup.enter="$emit('save-config')"
                  @keyup.esc="$emit('cancel-edit')"
                  autofocus
                />
              </td>

              <!-- Description (editable) -->
              <td class="px-6 py-4">
                <div
                  v-if="editingConfig?.key !== config.key"
                  class="text-xs text-gray-400 cursor-pointer hover:text-gray-300 transition-all duration-200 px-3 py-2 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 hover:border-gray-600/50"
                  @click="$emit('start-edit', config)"
                  title="Click để sửa"
                >
                  {{ config.description || '-' }}
                </div>
                <textarea
                  v-else
                  :value="editingConfig.description"
                  @input="$emit('update-editing-description', ($event.target as HTMLTextAreaElement).value)"
                  class="w-full bg-gray-700/80 text-white px-4 py-2.5 rounded-lg text-xs border-2 border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-400 shadow-lg shadow-yellow-500/20 transition-all duration-200 resize-none"
                  rows="2"
                ></textarea>
              </td>

              <!-- Active Status -->
              <td class="px-6 py-4 text-center">
                <div v-if="editingConfig?.key !== config.key">
                  <span
                    :class="
                      config.is_active
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/40'
                        : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border-red-500/40'
                    "
                    class="text-xs font-semibold px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5"
                  >
                    <span
                      :class="
                        config.is_active ? 'text-green-400' : 'text-red-400'
                      "
                    >
                      {{ config.is_active ? '✓' : '✗' }}
                    </span>
                    {{ config.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <label
                  v-else
                  class="flex items-center justify-center gap-2 cursor-pointer"
                >
                  <input
                    :checked="editingConfig.is_active"
                    @change="$emit('update-editing-active', ($event.target as HTMLInputElement).checked)"
                    type="checkbox"
                    class="w-4 h-4 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer transition-all"
                  />
                  <span class="text-xs text-gray-300 font-medium">Active</span>
                </label>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-center">
                <div
                  v-if="editingConfig?.key !== config.key"
                  class="flex gap-2 justify-center"
                >
                  <button
                    @click.stop="$emit('start-edit', config)"
                    class="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1.5"
                    title="Sửa config này"
                  >
                    <span>✏️</span>
                    <span>Sửa</span>
                  </button>
                </div>
                <div v-else class="flex gap-2 justify-center">
                  <button
                    @click.stop="$emit('save-config')"
                    class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1.5"
                    title="Lưu thay đổi"
                  >
                    <span>💾</span>
                    <span>Lưu</span>
                  </button>
                  <button
                    @click.stop="$emit('cancel-edit')"
                    class="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-lg shadow-gray-500/20 hover:shadow-gray-500/30 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1.5"
                    title="Hủy thay đổi"
                  >
                    <span>❌</span>
                    <span>Hủy</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  systemConfigs: any[];
  editingConfig: any;
}>();

defineEmits<{
  'start-edit': [config: any];
  'update-editing-value': [value: string];
  'update-editing-description': [value: string];
  'update-editing-active': [value: boolean];
  'save-config': [];
  'cancel-edit': [];
}>();
</script>

