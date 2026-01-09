<template>
  <div
    class="bg-gray-800 p-3 rounded-lg flex items-center justify-between"
    :class="index < 3 ? 'border-2 border-yellow-500' : ''"
  >
    <div class="flex items-center gap-3">
      <span class="text-lg font-bold w-8 text-center">
        {{ index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${entry.rank}` }}
      </span>
      <div>
        <div class="font-bold text-white">Character #{{ entry.character_id }}</div>
        <div class="text-sm text-gray-400" :title="entry.score.toLocaleString('vi-VN')">
          Điểm: {{ formatNumber(entry.score) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatNumber } from '../../utils/formatNumber';

interface LeaderboardEntry {
  id: number;
  character_id: number;
  leaderboard_type: string;
  period: string;
  score: number;
  rank: number;
}

defineProps<{
  entry: LeaderboardEntry;
  index: number;
}>();
</script>

