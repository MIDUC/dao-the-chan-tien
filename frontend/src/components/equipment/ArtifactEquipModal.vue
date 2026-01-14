<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-gray-200">Chọn Cổ Bảo</h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div v-if="loading" class="text-center text-gray-400 py-8">
        Đang tải...
      </div>

      <div v-else-if="artifacts.length === 0" class="text-center text-gray-400 py-8">
        Không có cổ bảo trong túi đồ
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="artifact in artifacts"
          :key="artifact.id"
          class="border border-gray-600 rounded-lg p-4 hover:border-purple-500 transition-colors cursor-pointer"
          @click="handleEquip(artifact.id)"
        >
          <div class="flex items-start gap-3">
            <img
              v-if="artifact.item.icon_url"
              :src="artifact.item.icon_url"
              :alt="artifact.item.name"
              class="w-16 h-16"
            />
            <div class="flex-1">
              <h4 class="text-sm font-semibold text-purple-300 mb-2">
                {{ artifact.item.name }}
              </h4>
              
              <!-- Stats -->
              <div v-if="artifact.specific_stats" class="text-xs space-y-1 mb-2">
                <div v-if="artifact.specific_stats.strength" class="text-green-400">
                  +{{ artifact.specific_stats.strength }} Sức mạnh
                </div>
                <div v-if="artifact.specific_stats.agility" class="text-green-400">
                  +{{ artifact.specific_stats.agility }} Nhanh nhẹn
                </div>
                <div v-if="artifact.specific_stats.wisdom" class="text-green-400">
                  +{{ artifact.specific_stats.wisdom }} Trí tuệ
                </div>
              </div>

              <!-- Effects -->
              <div v-if="artifact.specific_stats?.effects" class="text-xs space-y-1 mb-2">
                <div class="text-blue-300 font-semibold">Tác dụng:</div>
                <div v-if="artifact.specific_stats.effects.attack_bonus" class="text-blue-400">
                  +{{ artifact.specific_stats.effects.attack_bonus }} Tấn công
                </div>
              </div>

              <!-- Penalties -->
              <div v-if="artifact.specific_stats?.penalties" class="text-xs space-y-1">
                <div class="text-red-300 font-semibold">Tác hại:</div>
                <div v-if="artifact.specific_stats.penalties.hp_loss_per_attack" class="text-red-400">
                  -{{ artifact.specific_stats.penalties.hp_loss_per_attack }} HP mỗi lần tấn công
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { api } from '../../composables/useApi';

const props = defineProps<{
  show: boolean;
  characterId: number;
}>();

const emit = defineEmits<{
  close: [];
  equipped: [];
}>();

const artifacts = ref<any[]>([]);
const loading = ref(false);

const fetchArtifacts = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/characters/${props.characterId}/inventory`);
    const items = response.data || [];
    // Filter items that are ancient artifacts (category = 'ancient_artifact' or item_type = 'special')
    artifacts.value = items.filter(
      (item: any) =>
        item.item?.category === 'ancient_artifact' ||
        item.item?.item_type === 'special',
    );
  } catch (error) {
    console.error('Error fetching artifacts:', error);
  } finally {
    loading.value = false;
  }
};

const handleEquip = async (inventoryId: number) => {
  try {
    const response = await api.post('/equipment/equip-artifact', {
      inventoryId,
      characterId: props.characterId,
    });
    if (response.data.success) {
      emit('equipped');
    }
  } catch (error) {
    console.error('Error equipping artifact:', error);
  }
};

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      fetchArtifacts();
    }
  },
);

onMounted(() => {
  if (props.show) {
    fetchArtifacts();
  }
});
</script>

