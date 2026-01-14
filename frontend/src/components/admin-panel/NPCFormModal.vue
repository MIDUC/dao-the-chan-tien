<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div
      class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-purple-500/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-purple-400">
            {{ editingNPC ? 'Sửa NPC' : 'Tạo NPC Mới' }}
          </h2>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Basic Info -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              Tên *
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              Mô tả
            </label>
            <textarea
              v-model="formData.description"
              rows="4"
              class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              Avatar URL
            </label>
            <input
              v-model="formData.avatar_url"
              type="text"
              class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <!-- Spawn Time -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Thời gian xuất hiện (Bắt đầu)
              </label>
              <input
                v-model="formData.spawn_time_start"
                type="time"
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Thời gian xuất hiện (Kết thúc)
              </label>
              <input
                v-model="formData.spawn_time_end"
                type="time"
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <!-- Active Status -->
          <div class="flex items-center gap-2">
            <input
              v-model="formData.is_active"
              type="checkbox"
              id="is_active"
              class="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
            />
            <label for="is_active" class="text-sm text-gray-300">
              NPC đang hoạt động
            </label>
          </div>

          <!-- Quests List (if editing) -->
          <div v-if="editingNPC && editingNPC.quests" class="border-t border-gray-700 pt-4">
            <h3 class="text-lg font-semibold text-purple-400 mb-3">
              Các nhiệm vụ của NPC ({{ editingNPC.quests.length }})
            </h3>
            <div v-if="editingNPC.quests.length === 0" class="text-gray-400 text-sm">
              NPC này chưa có nhiệm vụ nào
            </div>
            <div
              v-for="quest in editingNPC.quests"
              :key="quest.id"
              class="bg-gray-800/50 p-3 rounded mb-2"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-semibold text-white">{{ quest.title }}</h4>
                  <p class="text-xs text-gray-400 mt-1">{{ quest.description }}</p>
                  <div class="flex gap-2 mt-2">
                    <span class="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                      {{ quest.quest_type }}
                    </span>
                    <span class="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                      EXP: {{ quest.reward?.exp || 0 }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="submit"
              class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              {{ editingNPC ? 'Cập nhật' : 'Tạo mới' }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  editingNPC?: any;
}>();

const emit = defineEmits<{
  close: [];
  submit: [data: any];
}>();

const formData = ref({
  name: '',
  description: '',
  avatar_url: '',
  spawn_time_start: null as string | null,
  spawn_time_end: null as string | null,
  is_active: true,
});

watch(
  () => props.editingNPC,
  (npc) => {
    if (npc) {
      formData.value = {
        name: npc.name || '',
        description: npc.description || '',
        avatar_url: npc.avatar_url || '',
        spawn_time_start: npc.spawn_time_start || null,
        spawn_time_end: npc.spawn_time_end || null,
        is_active: npc.is_active !== undefined ? npc.is_active : true,
      };
    } else {
      // Reset form
      formData.value = {
        name: '',
        description: '',
        avatar_url: '',
        spawn_time_start: null,
        spawn_time_end: null,
        is_active: true,
      };
    }
  },
  { immediate: true }
);

const handleSubmit = () => {
  // Clean up null values
  const cleanedData = {
    ...formData.value,
    avatar_url: formData.value.avatar_url || undefined,
    spawn_time_start: formData.value.spawn_time_start || undefined,
    spawn_time_end: formData.value.spawn_time_end || undefined,
  };

  emit('submit', cleanedData);
};
</script>

