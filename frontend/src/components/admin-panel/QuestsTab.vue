<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-xl font-bold text-purple-400">Quản lý Nhiệm Vụ</h3>
      <button
        @click="showCreateModal = true"
        class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
      >
        + Tạo Nhiệm Vụ Mới
      </button>
    </div>

    <div v-if="quests.length === 0" class="text-gray-400 text-center py-8">
      Chưa có quest nào
    </div>
    <div
      v-for="quest in quests"
      :key="quest.id"
      class="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
    >
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="font-bold text-white text-lg">{{ quest.title }}</h3>
            <span
              class="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded"
            >
              {{ quest.quest_type }}
            </span>
            <span
              v-if="quest.npc"
              class="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded"
            >
              {{ quest.npc.name }}
            </span>
          </div>
          <p class="text-sm text-gray-400 mb-2">{{ quest.description }}</p>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="text-gray-500">
              EXP: <span class="text-yellow-400">{{ quest.reward?.exp || 0 }}</span>
            </span>
            <span v-if="quest.reward?.spirit" class="text-gray-500">
              Spirit: <span class="text-green-400">{{ quest.reward.spirit }}</span>
            </span>
            <span class="text-gray-500">
              Deadline: <span class="text-orange-400">{{ quest.deadline_hours }}h</span>
            </span>
            <span
              :class="quest.is_active ? 'text-green-400' : 'text-red-400'"
            >
              {{ quest.is_active ? 'Hoạt động' : 'Tạm dừng' }}
            </span>
          </div>
        </div>
        <div class="flex gap-2 ml-4">
          <button
            @click="handleEdit(quest)"
            class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition-colors"
          >
            Sửa
          </button>
          <button
            @click="$emit('delete-quest', quest.id)"
            class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>

    <QuestFormModal
      :show="showCreateModal || editingQuest !== null"
      :editing-quest="editingQuest"
      :npcs="npcs"
      @close="handleCloseModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import QuestFormModal from './QuestFormModal.vue';

const props = defineProps<{
  quests: any[];
  npcs: any[];
}>();

const emit = defineEmits<{
  'edit-quest': [quest: any];
  'delete-quest': [questId: number];
  'create-quest': [data: any];
  'update-quest': [id: number, data: any];
}>();

const showCreateModal = ref(false);
const editingQuest = ref<any>(null);

const handleEdit = (quest: any) => {
  editingQuest.value = quest;
};

const handleCloseModal = () => {
  showCreateModal.value = false;
  editingQuest.value = null;
};

const handleSubmit = (data: any) => {
  if (editingQuest.value) {
    emit('update-quest', editingQuest.value.id, data);
  } else {
    emit('create-quest', data);
  }
  handleCloseModal();
};
</script>

