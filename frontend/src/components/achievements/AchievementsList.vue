<template>
  <div class="w-full">
    <h2 class="text-xl font-bold mb-4 text-dao-gold">Thành Tựu</h2>

    <div v-if="loading" class="text-gray-400 animate-pulse">Đang tải...</div>

    <div v-else class="space-y-3">
      <AchievementCard
        v-for="achievement in characterAchievements"
        :key="achievement.id"
        :achievement="achievement"
        @claim-reward="handleClaimReward"
      />

      <div
        v-if="characterAchievements.length === 0"
        class="text-gray-400 text-center py-8"
      >
        Chưa có thành tựu nào
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../composables/useApi';
import AchievementCard from './AchievementCard.vue';

interface Achievement {
  id: number;
  name: string;
  description: string;
  achievement_type: string;
  rarity: number;
}

interface CharacterAchievement {
  id: number;
  character_id: number;
  achievement_id: number;
  is_unlocked: boolean;
  reward_claimed: boolean;
  achievement?: Achievement;
}

const props = defineProps<{
  characterId: number;
}>();

const characterAchievements = ref<CharacterAchievement[]>([]);
const loading = ref(true);

const fetchAchievements = async () => {
  try {
    const response = await api.get(`/achievements/character/${props.characterId}`);
    characterAchievements.value = response.data;
  } catch (error) {
    console.error('Error fetching achievements:', error);
  } finally {
    loading.value = false;
  }
};

const handleClaimReward = async (achievementId: number) => {
  try {
    const response = await api.post(`/achievements/claim/${props.characterId}/${achievementId}`);
    if (response.data.success) {
      alert('Nhận thưởng thành công!');
      await fetchAchievements();
    }
  } catch (error) {
    console.error('Error claiming reward:', error);
    alert('Có lỗi xảy ra');
  }
};

onMounted(() => {
  fetchAchievements();
});
</script>

