<template>
  <div class="w-full">
    <h2 class="text-xl font-bold mb-4 text-dao-gold">Kỹ Năng</h2>

    <div v-if="loading" class="text-gray-400 animate-pulse">Đang tải...</div>

    <div v-else class="space-y-3">
      <SkillCard
        v-for="skill in skills"
        :key="skill.id"
        :skill="skill"
        :is-unlocked="isSkillUnlocked(skill.id)"
        :skill-level="getSkillLevel(skill.id)"
        @unlock-skill="handleUnlockSkill"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../composables/useApi';
import SkillCard from './SkillCard.vue';

interface Skill {
  id: number;
  name: string;
  description: string;
  skill_type: string;
  category: string;
  max_level: number;
}

interface CharacterSkill {
  id: number;
  character_id: number;
  skill_id: number;
  level: number;
  is_unlocked: boolean;
}

const props = defineProps<{
  characterId: number;
}>();

const skills = ref<Skill[]>([]);
const characterSkills = ref<CharacterSkill[]>([]);
const loading = ref(true);

const isSkillUnlocked = (skillId: number): boolean => {
  return characterSkills.value.some(
    (cs) => cs.skill_id === skillId && cs.is_unlocked,
  );
};

const getSkillLevel = (skillId: number): number => {
  const cs = characterSkills.value.find((cs) => cs.skill_id === skillId);
  return cs?.level || 0;
};

const fetchSkills = async () => {
  try {
    const [skillsRes, characterSkillsRes] = await Promise.all([
      api.get('/skills'),
      api.get(`/skills/character/${props.characterId}`),
    ]);
    skills.value = skillsRes.data;
    characterSkills.value = characterSkillsRes.data;
  } catch (error) {
    console.error('Error fetching skills:', error);
  } finally {
    loading.value = false;
  }
};

const handleUnlockSkill = async (skillId: number) => {
  try {
    const response = await api.post('/skills/unlock', {
      characterId: props.characterId,
      skillId,
    });
    if (response.data.success) {
      alert('Học kỹ năng thành công!');
      await fetchSkills();
    } else {
      alert(response.data.message || 'Học kỹ năng thất bại');
    }
  } catch (error) {
    console.error('Error unlocking skill:', error);
    alert('Có lỗi xảy ra');
  }
};

onMounted(() => {
  fetchSkills();
});
</script>

