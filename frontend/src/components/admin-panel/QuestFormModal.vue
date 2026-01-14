<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div
      class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-purple-500/30 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-purple-400">
            {{ editingQuest ? 'Sửa Nhiệm Vụ' : 'Tạo Nhiệm Vụ Mới' }}
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
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Tiêu đề *
              </label>
              <input
                v-model="formData.title"
                type="text"
                required
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                NPC *
              </label>
              <select
                v-model="formData.npc_id"
                required
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Chọn NPC</option>
                <option v-for="npc in npcs" :key="npc.id" :value="npc.id">
                  {{ npc.name }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              Mô tả *
            </label>
            <textarea
              v-model="formData.description"
              required
              rows="3"
              class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Loại nhiệm vụ *
              </label>
              <select
                v-model="formData.quest_type"
                required
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="push_up">Chống Đẩy</option>
                <option value="running">Chạy Bộ</option>
                <option value="meditation">Thiền</option>
                <option value="combat">Chiến Đấu</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Deadline (giờ)
              </label>
              <input
                v-model.number="formData.deadline_hours"
                type="number"
                min="1"
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <!-- Requirements -->
          <div class="border-t border-gray-700 pt-4">
            <h3 class="text-lg font-semibold text-purple-400 mb-3">
              Yêu cầu nhiệm vụ
            </h3>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Target
                </label>
                <input
                  v-model.number="formData.requirements.target"
                  type="number"
                  min="0"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Min
                </label>
                <input
                  v-model.number="formData.requirements.min"
                  type="number"
                  min="0"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Max
                </label>
                <input
                  v-model.number="formData.requirements.max"
                  type="number"
                  min="0"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div class="mt-2">
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Unit
              </label>
              <input
                v-model="formData.requirements.unit"
                type="text"
                placeholder="lần, km, phút..."
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <!-- Conditions -->
          <div class="border-t border-gray-700 pt-4">
            <h3 class="text-lg font-semibold text-purple-400 mb-3">
              Điều kiện (Optional)
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Min Lực Đạo
                </label>
                <input
                  v-model.number="formData.conditions.min_luc_dao"
                  type="number"
                  min="0"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Min Căn Cốt
                </label>
                <input
                  v-model.number="formData.conditions.min_can_cot"
                  type="number"
                  min="0"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Min Thân Pháp
                </label>
                <input
                  v-model.number="formData.conditions.min_than_phap"
                  type="number"
                  min="0"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Min Ngộ Tính
                </label>
                <input
                  v-model.number="formData.conditions.min_ngo_tinh"
                  type="number"
                  min="0"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Min Định Lực
                </label>
                <input
                  v-model.number="formData.conditions.min_dinh_luc"
                  type="number"
                  min="0"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Min Realm Level
                </label>
                <input
                  v-model.number="formData.conditions.min_realm_level"
                  type="number"
                  min="1"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <!-- Reward -->
          <div class="border-t border-gray-700 pt-4">
            <h3 class="text-lg font-semibold text-purple-400 mb-3">
              Phần thưởng *
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  EXP *
                </label>
                <input
                  v-model.number="formData.reward.exp"
                  type="number"
                  required
                  min="0"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Spirit
                </label>
                <input
                  v-model.number="formData.reward.spirit"
                  type="number"
                  min="0"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
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
              Nhiệm vụ đang hoạt động
            </label>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="submit"
              class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              {{ editingQuest ? 'Cập nhật' : 'Tạo mới' }}
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
  editingQuest?: any;
  npcs: any[];
}>();

const emit = defineEmits<{
  close: [];
  submit: [data: any];
}>();

const formData = ref({
  title: '',
  description: '',
  quest_type: 'push_up',
  npc_id: null as number | null,
  deadline_hours: 24,
  requirements: {
    target: null as number | null,
    min: null as number | null,
    max: null as number | null,
    unit: '',
  },
  conditions: {
    min_luc_dao: null as number | null,
    min_can_cot: null as number | null,
    min_than_phap: null as number | null,
    min_ngo_tinh: null as number | null,
    min_dinh_luc: null as number | null,
    min_realm_level: null as number | null,
  },
  reward: {
    exp: 0,
    spirit: null as number | null,
  },
  is_active: true,
});

watch(
  () => props.editingQuest,
  (quest) => {
    if (quest) {
      formData.value = {
        title: quest.title || '',
        description: quest.description || '',
        quest_type: quest.quest_type || 'push_up',
        npc_id: quest.npc_id || null,
        deadline_hours: quest.deadline_hours || 24,
        requirements: quest.requirements || {
          target: null,
          min: null,
          max: null,
          unit: '',
        },
        conditions: quest.conditions || {
          min_luc_dao: null,
          min_can_cot: null,
          min_than_phap: null,
          min_ngo_tinh: null,
          min_dinh_luc: null,
          min_realm_level: null,
        },
        reward: quest.reward || { exp: 0, spirit: null },
        is_active: quest.is_active !== undefined ? quest.is_active : true,
      };
    } else {
      // Reset form
      formData.value = {
        title: '',
        description: '',
        quest_type: 'push_up',
        npc_id: null,
        deadline_hours: 24,
        requirements: { target: null, min: null, max: null, unit: '' },
        conditions: {
          min_luc_dao: null,
          min_can_cot: null,
          min_than_phap: null,
          min_ngo_tinh: null,
          min_dinh_luc: null,
          min_realm_level: null,
        },
        reward: { exp: 0, spirit: null },
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
    requirements: Object.fromEntries(
      Object.entries(formData.value.requirements).filter(
        ([_, v]) => v !== null && v !== ''
      )
    ),
    conditions: Object.fromEntries(
      Object.entries(formData.value.conditions).filter(([_, v]) => v !== null)
    ),
    reward: Object.fromEntries(
      Object.entries(formData.value.reward).filter(([_, v]) => v !== null)
    ),
  };

  emit('submit', cleanedData);
};
</script>

