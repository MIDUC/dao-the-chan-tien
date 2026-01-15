<template>
  <div class="talents-view w-full p-4">
    <h2 class="text-xl font-bold text-gray-200 mb-4">Thiên Phú</h2>

    <!-- Loading State -->
    <div v-if="loading" class="text-center text-gray-400 py-8">
      Đang tải thiên phú...
    </div>

    <!-- Talents Grid (max 4 per row) -->
    <div v-else class="talents-grid grid grid-cols-4 gap-3 mb-4">
      <!-- Debug info -->
      <div v-if="talents.length > 0" class="col-span-4 text-xs text-gray-500 mb-2">
        Tìm thấy {{ talents.length }} thiên phú
      </div>
      <div
        v-for="(talent, index) in displayedTalents"
        :key="talent?.id || index"
        class="talent-card relative cursor-pointer transition-all"
        :class="{
          'border-2': selectedTalent?.id === talent.id,
          'border-yellow-500': selectedTalent?.id === talent.id,
        }"
        :style="getTalentBorderStyle(talent.grade)"
        @click="selectTalent(talent)"
      >
        <div class="talent-icon p-3 flex items-center justify-center">
          <div class="text-3xl">✨</div>
        </div>
        <div class="talent-name text-xs text-center p-1 text-gray-200 truncate">
          {{ talent.name }}
        </div>
      </div>

      <!-- Empty slots -->
      <div
        v-for="n in emptySlots"
        :key="`empty-${n}`"
        class="talent-card-empty border-2 border-dashed border-gray-600 p-3 flex items-center justify-center"
      >
        <div class="text-gray-500 text-xs">Trống</div>
      </div>
    </div>

    <!-- Talent Details Panel -->
    <div
      v-if="selectedTalent"
      class="talent-details bg-gray-800/50 rounded-lg border p-4"
      :style="getTalentBorderStyle(selectedTalent.grade, true)"
    >
      <div class="flex items-start justify-between mb-3">
        <div>
          <h3 class="text-lg font-bold text-gray-200 mb-1">
            {{ selectedTalent.name }}
          </h3>
          <div
            class="text-xs px-2 py-1 rounded inline-block"
            :style="getGradeBadgeStyle(selectedTalent.grade)"
          >
            {{ getGradeName(selectedTalent.grade) }}
          </div>
        </div>
        <button
          @click="selectedTalent = null"
          class="text-gray-400 hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>

      <p class="text-sm text-gray-300 mb-4">{{ selectedTalent.description }}</p>

      <!-- Effects -->
      <div v-if="selectedTalent.effects && selectedTalent.effects.length > 0">
        <h4 class="text-sm font-semibold text-gray-200 mb-2">Hiệu Ứng:</h4>
        <div class="space-y-2">
          <div
            v-for="(effect, index) in selectedTalent.effects"
            :key="index"
            class="effect-item bg-gray-700/50 rounded p-2"
          >
            <div class="text-xs text-gray-300">
              {{ effect.description }}
            </div>
          </div>
        </div>
      </div>

      <!-- Obtained info -->
      <div
        v-if="selectedTalent.obtained_at"
        class="mt-4 text-xs text-gray-400"
      >
        Nhận được: {{ formatDate(selectedTalent.obtained_at) }} từ
        {{ selectedTalent.obtained_from || 'không xác định' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { api } from '../../composables/useApi';

interface TalentEffect {
  type: string;
  target?: string;
  value: number;
  description: string;
}

interface Talent {
  id: number;
  code: string;
  name: string;
  description: string;
  grade: string;
  effects?: TalentEffect[];
  obtained_at?: string;
  obtained_from?: string;
}

const props = defineProps<{
  characterId: number;
}>();

const talents = ref<Talent[]>([]);
const selectedTalent = ref<Talent | null>(null);
const loading = ref(false);

const displayedTalents = computed(() => {
  console.log('TalentsView: displayedTalents computed, talents.value:', talents.value);
  return talents.value.slice(0, 4);
});

const emptySlots = computed(() => {
  const count = 4 - talents.value.length;
  return count > 0 ? count : 0;
});

const getTalentBorderStyle = (grade: string, isDetail: boolean = false) => {
  const styles: Record<string, string> = {
    common: isDetail
      ? 'border-gray-500 bg-gray-800/30'
      : 'border-gray-500 bg-gray-800/20',
    uncommon: isDetail
      ? 'border-green-500 bg-green-900/20'
      : 'border-green-500 bg-green-900/10',
    rare: isDetail
      ? 'border-blue-500 bg-blue-900/20'
      : 'border-blue-500 bg-blue-900/10',
    epic: isDetail
      ? 'border-purple-500 bg-purple-900/20'
      : 'border-purple-500 bg-purple-900/10',
    legendary: isDetail
      ? 'border-yellow-500 bg-yellow-900/20'
      : 'border-yellow-500 bg-yellow-900/10',
    mythic: isDetail
      ? 'border-red-500 bg-red-900/20'
      : 'border-red-500 bg-red-900/10',
  };
  return {
    border: `2px solid`,
    borderColor: styles[grade]?.split(' ')[0]?.replace('border-', '') || 'gray',
    backgroundColor: styles[grade]?.split(' ')[1] || 'transparent',
  };
};

const getGradeBadgeStyle = (grade: string) => {
  const styles: Record<string, string> = {
    common: 'background-color: #6b7280; color: white;',
    uncommon: 'background-color: #10b981; color: white;',
    rare: 'background-color: #3b82f6; color: white;',
    epic: 'background-color: #a855f7; color: white;',
    legendary: 'background-color: #eab308; color: black;',
    mythic: 'background-color: #ef4444; color: white;',
  };
  return styles[grade] || styles.common;
};

const getGradeName = (grade: string): string => {
  const names: Record<string, string> = {
    common: 'Phàm',
    uncommon: 'Tốt',
    rare: 'Hiếm',
    epic: 'Cực Hiếm',
    legendary: 'Huyền Thoại',
    mythic: 'Thần Thoại',
  };
  return names[grade] || grade;
};

const selectTalent = (talent: Talent) => {
  selectedTalent.value = talent;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

const fetchCharacterTalents = async () => {
  if (!props.characterId) {
    console.warn('TalentsView: No characterId provided', props.characterId);
    return;
  }
  loading.value = true;
  try {
    console.log('TalentsView: Fetching talents for characterId:', props.characterId);
    const response = await api.get(`/talents/character/${props.characterId}`);
    console.log('TalentsView: Full API response:', response);
    
    // api.get() returns axios response, so we need response.data
    const data = response.data || response;
    console.log('TalentsView: Extracted data:', data);
    console.log('TalentsView: Is array?', Array.isArray(data));
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('TalentsView: Processing', data.length, 'talents');
      talents.value = data.map((ct: any) => {
        console.log('TalentsView: Processing item:', ct);
        // CharacterTalent has structure: { id, character_id, talent_id, talent: {...}, obtained_at, obtained_from }
        const talent = ct.talent;
        if (!talent) {
          console.warn('TalentsView: Missing talent property in:', ct);
          return null;
        }
        const processed = {
          ...talent,
          obtained_at: ct.obtained_at,
          obtained_from: ct.obtained_from,
        };
        console.log('TalentsView: Processed talent:', processed);
        return processed;
      }).filter((t: any) => t !== null && t.id);
      console.log('TalentsView: Final talents array:', talents.value);
      console.log('TalentsView: talents.value.length:', talents.value.length);
    } else {
      console.warn('TalentsView: No talents found. Data type:', typeof data, 'Data:', data);
      talents.value = [];
    }
  } catch (error: any) {
    console.error('TalentsView: Error fetching character talents:', error);
    console.error('TalentsView: Error response:', error.response?.data);
    talents.value = [];
  } finally {
    loading.value = false;
  }
};

// Watch for characterId changes
watch(
  () => props.characterId,
  (newId) => {
    if (newId) {
      fetchCharacterTalents();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.characterId) {
    fetchCharacterTalents();
  }
});
</script>

<style scoped>
.talent-card {
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.talent-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.talent-card-empty {
  border-radius: 8px;
  min-height: 80px;
}

.talent-icon {
  min-height: 60px;
}
</style>

