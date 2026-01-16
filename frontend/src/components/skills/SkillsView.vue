<template>
  <div class="skills-view w-full p-4">
    <h2 class="text-xl font-bold text-gray-200 mb-4">Kỹ Năng</h2>

    <!-- Loading State -->
    <div v-if="loading" class="text-center text-gray-400 py-8">
      Đang tải kỹ năng...
    </div>

    <!-- Skills List -->
    <div v-else class="space-y-4">
      <!-- Learned Skills -->
      <div v-if="learnedSkills.length > 0">
        <h3 class="text-lg font-semibold text-gray-200 mb-3">Kỹ Năng Đã Học</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="cs in learnedSkills"
            :key="cs.id"
            class="skill-card bg-gray-800/50 rounded-lg border border-gray-700 p-4 cursor-pointer transition-all hover:border-yellow-500"
            @click="selectSkill(cs.skill)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="text-base font-bold text-gray-200 mb-1">{{ cs.skill.name }}</h4>
                <p class="text-xs text-gray-400 mb-2">{{ cs.skill.description }}</p>
                <div class="flex gap-2 text-xs text-gray-500">
                  <span>Cấp {{ cs.level }}</span>
                  <span>•</span>
                  <span>CD: {{ cs.skill.cooldown }}s</span>
                  <span>•</span>
                  <span>MP: {{ cs.skill.mana_cost }}</span>
                </div>
              </div>
              <button
                @click.stop="calculateDamage(cs.skill.id)"
                class="text-yellow-400 hover:text-yellow-300 text-xs px-2 py-1 border border-yellow-400 rounded"
              >
                Xem Sát Thương
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Available Skills (Personal skills not yet learned) -->
      <div v-if="availableSkills.length > 0">
        <h3 class="text-lg font-semibold text-gray-200 mb-3">Kỹ Năng Có Thể Học</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="skill in availableSkills"
            :key="skill.id"
            class="skill-card bg-gray-800/50 rounded-lg border border-gray-700 p-4"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="text-base font-bold text-gray-200 mb-1">{{ skill.name }}</h4>
                <p class="text-xs text-gray-400 mb-2">{{ skill.description }}</p>
                <div class="flex gap-2 text-xs text-gray-500 mb-2">
                  <span>CD: {{ skill.cooldown }}s</span>
                  <span>•</span>
                  <span>MP: {{ skill.mana_cost }}</span>
                  <span>•</span>
                  <span>Cấp yêu cầu: {{ skill.min_level }}</span>
                </div>
                <!-- Damage Formula Preview -->
                <div class="text-xs text-gray-500">
                  <span class="text-gray-400">Công thức:</span>
                  <span v-for="(formula, idx) in skill.damage_formula" :key="idx" class="ml-1">
                    {{ getFormulaText(formula) }}
                    <span v-if="idx < skill.damage_formula.length - 1"> + </span>
                  </span>
                </div>
              </div>
              <button
                @click="learnSkill(skill.id)"
                :disabled="learning"
                class="text-green-400 hover:text-green-300 text-xs px-2 py-1 border border-green-400 rounded disabled:opacity-50"
              >
                Học
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Skill Details Modal -->
    <div
      v-if="selectedSkill"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="selectedSkill = null"
    >
      <div
        class="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-2xl w-full mx-4"
        @click.stop
      >
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-200">{{ selectedSkill.name }}</h3>
          <button
            @click="selectedSkill = null"
            class="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        <p class="text-sm text-gray-300 mb-4">{{ selectedSkill.description }}</p>
        <div class="space-y-2">
          <div class="text-sm text-gray-400">
            <span class="font-semibold">Thời gian hồi chiêu:</span> {{ selectedSkill.cooldown }}s
          </div>
          <div class="text-sm text-gray-400">
            <span class="font-semibold">Chi phí mana:</span> {{ selectedSkill.mana_cost }}
          </div>
          <div class="text-sm text-gray-400">
            <span class="font-semibold">Cấp yêu cầu:</span> {{ selectedSkill.min_level }}
          </div>
          <div class="mt-4">
            <h4 class="text-sm font-semibold text-gray-200 mb-2">Công Thức Sát Thương:</h4>
            <div class="space-y-1">
              <div
                v-for="(formula, idx) in selectedSkill.damage_formula"
                :key="idx"
                class="text-sm text-gray-300 bg-gray-700/50 rounded p-2"
              >
                {{ getFormulaText(formula) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Damage Calculation Modal -->
    <div
      v-if="damageResult"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="damageResult = null"
    >
      <div
        class="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full mx-4"
        @click.stop
      >
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-200">Sát Thương Kỹ Năng</h3>
          <button
            @click="damageResult = null"
            class="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        <div class="space-y-2">
          <div class="text-2xl font-bold text-yellow-400 text-center mb-4">
            {{ damageResult.damage.toLocaleString() }} sát thương
          </div>
          <div class="text-sm text-gray-400 mb-2">Chi tiết:</div>
          <div
            v-for="(item, idx) in damageResult.breakdown"
            :key="idx"
            class="text-sm text-gray-300 bg-gray-700/50 rounded p-2"
          >
            {{ item.source }}: {{ item.value }} × {{ item.multiplier }}% = {{ item.damage.toLocaleString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { api } from '../../composables/useApi';

interface DamageFormula {
  stat?: string;
  element?: string;
  multiplier: number;
}

interface Skill {
  id: number;
  code: string;
  name: string;
  description: string;
  damage_formula: DamageFormula[];
  cooldown: number;
  mana_cost: number;
  min_level: number;
  character_id?: number | null;
}

interface CharacterSkill {
  id: number;
  skill: Skill;
  level: number;
}

const props = defineProps<{
  characterId: number;
  characterLevel?: number;
}>();

const allSkills = ref<Skill[]>([]);
const characterSkills = ref<CharacterSkill[]>([]);
const selectedSkill = ref<Skill | null>(null);
const damageResult = ref<any>(null);
const loading = ref(false);
const learning = ref(false);

const learnedSkills = computed(() => {
  // Only show skills that are actually learned (have level > 0)
  return characterSkills.value.filter(cs => cs.level > 0);
});

const availableSkills = computed(() => {
  const learnedIds = new Set(characterSkills.value.filter(cs => cs.level > 0).map(cs => cs.skill.id));
  // Only show personal skills for this character that haven't been learned yet
  return allSkills.value.filter(skill => {
    if (learnedIds.has(skill.id)) return false;
    if (props.characterLevel && skill.min_level > props.characterLevel) return false;
    // Only show personal skills for this character
    return skill.character_id === props.characterId;
  });
});

const getFormulaText = (formula: DamageFormula): string => {
  if (formula.stat) {
    const statNames: Record<string, string> = {
      luc_dao: 'Lực Đạo',
      can_cot: 'Căn Cốt',
      than_phap: 'Thân Pháp',
      ngo_tinh: 'Ngộ Tính',
      dinh_luc: 'Định Lực',
    };
    return `${statNames[formula.stat] || formula.stat} × ${formula.multiplier}%`;
  } else if (formula.element) {
    const elementNames: Record<string, string> = {
      kim: 'Kim',
      moc: 'Mộc',
      thuy: 'Thủy',
      hoa: 'Hỏa',
      tho: 'Thổ',
      loi: 'Lôi',
      bang: 'Băng',
      duong: 'Dương',
      am: 'Âm',
    };
    return `${elementNames[formula.element] || formula.element} × ${formula.multiplier}%`;
  }
  return '';
};

const selectSkill = (skill: Skill) => {
  selectedSkill.value = skill;
};

const learnSkill = async (skillId: number) => {
  if (learning.value) return;
  learning.value = true;
  try {
    await api.post(`/skills/character/${props.characterId}/learn`, { skillId });
    await fetchCharacterSkills();
  } catch (error: any) {
    console.error('Error learning skill:', error);
    alert(error.response?.data?.message || 'Không thể học kỹ năng');
  } finally {
    learning.value = false;
  }
};

const calculateDamage = async (skillId: number) => {
  try {
    const response = await api.get(`/skills/character/${props.characterId}/${skillId}/damage`);
    damageResult.value = response.data;
  } catch (error) {
    console.error('Error calculating damage:', error);
  }
};

const fetchAllSkills = async () => {
  try {
    const response = await api.get('/skills');
    allSkills.value = response.data || [];
  } catch (error) {
    console.error('Error fetching skills:', error);
    allSkills.value = [];
  }
};

const fetchCharacterSkills = async () => {
  if (!props.characterId) return;
  loading.value = true;
  try {
    const response = await api.get(`/skills/character/${props.characterId}`);
    characterSkills.value = response.data || [];
  } catch (error) {
    console.error('Error fetching character skills:', error);
    characterSkills.value = [];
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.characterId,
  (newId) => {
    if (newId) {
      fetchCharacterSkills();
    }
  },
  { immediate: true }
);

onMounted(() => {
  fetchAllSkills();
  if (props.characterId) {
    fetchCharacterSkills();
  }
});
</script>

<style scoped>
.skill-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>

