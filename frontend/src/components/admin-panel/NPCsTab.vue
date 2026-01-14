<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-xl font-bold text-purple-400">Quản lý NPC</h3>
      <button
        @click="showCreateModal = true"
        class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
      >
        + Tạo NPC Mới
      </button>
    </div>

    <div v-if="npcs.length === 0" class="text-gray-400 text-center py-8">
      Chưa có NPC nào
    </div>
    <div
      v-for="npc in npcs"
      :key="npc.id"
      class="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
    >
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="font-bold text-white text-lg">{{ npc.name }}</h3>
            <span
              v-if="npc.quests && npc.quests.length > 0"
              class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded"
            >
              {{ npc.quests.length }} nhiệm vụ
            </span>
            <span
              :class="npc.is_active ? 'text-green-400' : 'text-red-400'"
              class="text-xs"
            >
              {{ npc.is_active ? 'Hoạt động' : 'Tạm dừng' }}
            </span>
          </div>
          <p class="text-sm text-gray-400 mb-2">{{ npc.description }}</p>
          <div v-if="npc.spawn_time_start || npc.spawn_time_end" class="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
            <span v-if="npc.spawn_time_start">
              Xuất hiện: <span class="text-blue-400">{{ npc.spawn_time_start }}</span>
            </span>
            <span v-if="npc.spawn_time_end">
              - <span class="text-blue-400">{{ npc.spawn_time_end }}</span>
            </span>
          </div>
          <div v-if="npc.quests && npc.quests.length > 0" class="mt-3">
            <h4 class="text-sm font-semibold text-purple-400 mb-2">Các nhiệm vụ:</h4>
            <div class="space-y-2">
              <div
                v-for="quest in npc.quests"
                :key="quest.id"
                class="bg-gray-800/50 p-2 rounded text-xs"
              >
                <div class="font-semibold text-white">{{ quest.title }}</div>
                <div class="text-gray-400 mt-1">{{ quest.description }}</div>
                <div class="flex gap-2 mt-2">
                  <span class="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                    {{ quest.quest_type }}
                  </span>
                  <span class="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                    EXP: {{ quest.reward?.exp || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-2 ml-4">
          <button
            @click="handleEdit(npc)"
            class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition-colors"
          >
            Sửa
          </button>
          <button
            @click="$emit('delete-npc', npc.id)"
            class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>

    <NPCFormModal
      :show="showCreateModal || editingNPC !== null"
      :editing-npc="editingNPC"
      @close="handleCloseModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NPCFormModal from './NPCFormModal.vue';

const props = defineProps<{
  npcs: any[];
}>();

const emit = defineEmits<{
  'edit-npc': [npc: any];
  'delete-npc': [npcId: number];
  'create-npc': [data: any];
  'update-npc': [id: number, data: any];
}>();

const showCreateModal = ref(false);
const editingNPC = ref<any>(null);

const handleEdit = (npc: any) => {
  editingNPC.value = npc;
};

const handleCloseModal = () => {
  showCreateModal.value = false;
  editingNPC.value = null;
};

const handleSubmit = (data: any) => {
  if (editingNPC.value) {
    emit('update-npc', editingNPC.value.id, data);
  } else {
    emit('create-npc', data);
  }
  handleCloseModal();
};
</script>

