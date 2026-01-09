<template>
  <div class="fixed-game-menu">
    <!-- Top Header: Title -->
    <div
      class="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-sm border-b border-purple-500/30"
    >
      <div class="flex items-center justify-between px-1 py-0.5">
        <!-- Game Title -->
        <div>
          <h1
            class="text-base font-thu-phap font-bold text-purple-300 leading-tight text-glow-purple"
          >
            Đạo Thể Chân Tiên
          </h1>
        </div>
      </div>
    </div>

    <!-- Player Info Section -->
    <div
      v-if="showPlayerInfo"
      class="px-1 py-0.5 bg-gray-900/80 border-b border-gray-700/50"
    >
      <div class="flex items-start gap-1">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div
            class="w-8 h-8 rounded-full border border-purple-500/50 overflow-hidden bg-gray-800"
          >
            <img
              :src="character?.avatar || characterImageSrc"
              :alt="character?.display_name || 'Character'"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

        <!-- Player Details -->
        <div class="flex-1 min-w-0">
          <div class="text-white text-[10px] font-semibold">
            {{ character?.display_name || "Người chơi" }}
          </div>
          <div class="text-gray-300 text-[10px] mt-0.5">
            Cấp {{ character?.realm_level || 0 }} |
            {{ realmDisplay || "Phàm cảnh" }}
          </div>
          <div class="flex flex-wrap gap-x-1 gap-y-0.5 mt-0.5 text-[10px]">
            <div>
              <span class="text-gray-400">Tiên Ngọc:</span>
              <span class="text-yellow-400 ml-1">{{
                formatCurrency(getCurrencyAmount("immortal_jade"))
              }}</span>
            </div>
            <div>
              <span class="text-gray-400">Tiên Ngọc khoá:</span>
              <span class="text-yellow-400 ml-1">{{
                formatCurrency(getCurrencyAmount("immortal_jade_locked"))
              }}</span>
            </div>
            <div>
              <span class="text-gray-400">Linh Thạch:</span>
              <span class="text-blue-400 ml-1">{{
                formatCurrency(getCurrencyAmount("ling_stone"))
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatNumber } from "../utils/formatNumber";
import characterImageSrc from "../assets/nhanvatngoithien1-removebg-preview.png";

interface Character {
  id?: number;
  display_name?: string;
  realm_level?: number;
  exp?: number;
  avatar?: string;
}

interface CurrencyItem {
  currency_type: string;
  amount: number;
}

const props = defineProps<{
  character?: Character;
  currencies?: CurrencyItem[];
  realmDisplay?: string;
  currentView?: string;
  showPlayerInfo?: boolean;
}>();

const formatCurrency = (value: number) => {
  return formatNumber(value);
};

const getCurrencyAmount = (type: string): number => {
  if (!props.currencies || !Array.isArray(props.currencies)) return 0;
  const currency = props.currencies.find((c) => c.currency_type === type);
  return currency?.amount || 0;
};
</script>

<style scoped>
.fixed-game-menu {
  display: flex;
  flex-direction: column;
}
</style>
