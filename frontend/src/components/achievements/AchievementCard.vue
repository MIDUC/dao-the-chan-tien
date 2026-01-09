<template>
  <div
    class="bg-gray-800 p-4 rounded-lg border"
    :class="achievement.is_unlocked ? 'border-yellow-500' : 'border-gray-700'"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h3 class="font-bold text-white mb-1">
          {{ achievement.achievement?.name }}
        </h3>
        <p class="text-sm text-gray-400 mb-2">
          {{ achievement.achievement?.description }}
        </p>
        <div v-if="achievement.is_unlocked" class="flex items-center gap-2">
          <span class="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
            Đã đạt được
          </span>
          <button
            v-if="!achievement.reward_claimed"
            @click="$emit('claim-reward', achievement.achievement_id)"
            class="text-xs bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
          >
            Nhận thưởng
          </button>
          <span
            v-else
            class="text-xs bg-gray-600 text-gray-400 px-2 py-1 rounded"
          >
            Đã nhận thưởng
          </span>
        </div>
        <div v-else class="text-xs text-gray-500">Chưa đạt được</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Achievement {
  id: number;
  name: string;
  description: string;
}

interface CharacterAchievement {
  id: number;
  achievement_id: number;
  is_unlocked: boolean;
  reward_claimed: boolean;
  achievement?: Achievement;
}

defineProps<{
  achievement: CharacterAchievement;
}>();

defineEmits<{
  'claim-reward': [achievementId: number];
}>();
</script>

