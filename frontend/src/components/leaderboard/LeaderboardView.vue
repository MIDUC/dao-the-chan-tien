<template>
  <div class="w-full">
    <h2 class="text-xl font-bold mb-4 text-dao-gold">Bảng Xếp Hạng</h2>

    <LeaderboardTypeSelector
      :leaderboard-types="leaderboardTypes"
      :selected-type="selectedType"
      @type-selected="handleTypeSelected"
    />

    <div v-if="loading" class="text-gray-400 animate-pulse">Đang tải...</div>

    <div v-else class="space-y-2">
      <LeaderboardEntry
        v-for="(entry, index) in leaderboard"
        :key="entry.id"
        :entry="entry"
        :index="index"
      />

      <div v-if="leaderboard.length === 0" class="text-gray-400 text-center py-8">
        Chưa có dữ liệu
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../composables/useApi';
import LeaderboardTypeSelector from './LeaderboardTypeSelector.vue';
import LeaderboardEntry from './LeaderboardEntry.vue';

interface LeaderboardEntry {
  id: number;
  character_id: number;
  leaderboard_type: string;
  period: string;
  score: number;
  rank: number;
}

const leaderboardTypes = [
  { value: 'realm_level', label: 'Cảnh Giới' },
  { value: 'exp', label: 'EXP' },
  { value: 'quest_completed', label: 'Quest' },
];

const leaderboard = ref<LeaderboardEntry[]>([]);
const selectedType = ref('realm_level');
const loading = ref(true);

const fetchLeaderboard = async () => {
  try {
    loading.value = true;
    const response = await api.get('/leaderboards', {
      params: {
        type: selectedType.value,
        period: 'all_time',
        limit: 100,
      },
    });
    leaderboard.value = response.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  } finally {
    loading.value = false;
  }
};

const handleTypeSelected = async (type: string) => {
  selectedType.value = type;
  await fetchLeaderboard();
};

onMounted(() => {
  fetchLeaderboard();
});
</script>

