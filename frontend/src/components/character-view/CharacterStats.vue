<template>
  <div>
    <!-- Character Stats -->
    <div class="mt-0.5 grid grid-cols-2 gap-0.5">
      <div
        class="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded p-0.5 border border-purple-500/20"
      >
        <div class="text-[10px] text-gray-400 mb-0.5">Cảnh giới</div>
        <div class="text-[10px] font-bold text-purple-400 truncate">
          {{ realmDisplay }}
        </div>
      </div>
      <div
        class="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded p-0.5 border border-blue-500/20"
      >
        <div class="text-[10px] text-gray-400 mb-0.5">Huyền lực</div>
        <div class="text-[10px] font-bold text-blue-400 truncate">
          {{ formatNumber(mysticPower) }}
        </div>
      </div>
    </div>

    <!-- Linh Khí (EXP) Bar -->
    <div class="mt-0.5 bg-gray-800/50 rounded p-0.5 border border-gray-700/50">
      <div class="flex items-center justify-between mb-0.5">
        <div class="text-[10px] text-gray-400">
          Linh Khí ({{ formatNumber(exp || 0) }}/{{
            formatNumber(expRequired || 0)
          }})
        </div>
        <div class="text-[10px] text-gray-300 font-semibold">
          {{ expPercentage }}%
        </div>
      </div>
      <div class="w-full bg-gray-700 rounded-full h-1">
        <div
          class="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all"
          :style="{ width: expPercentage + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatNumber } from "../../utils/formatNumber";

const props = defineProps<{
  realmDisplay: string;
  mysticPower: number;
  exp?: number;
  expRequired?: number;
}>();

defineEmits<{
  "open-breakthrough": [];
}>();

const expPercentage = computed(() => {
  if (!props.exp || !props.expRequired || props.expRequired === 0) {
    return 0;
  }
  const percentage = (props.exp / props.expRequired) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage * 100) / 100));
});
</script>
