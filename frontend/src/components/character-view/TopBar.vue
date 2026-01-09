<template>
  <div
    class="bg-gray-900/90 backdrop-blur-sm border-b border-purple-500/20 px-2 sm:px-4 py-2 sm:py-3"
  >
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0"
    >
      <!-- Left: Player Profile -->
      <div class="flex items-center gap-2 sm:gap-3">
        <img
          :src="characterImage"
          alt="Character"
          class="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-purple-400/50 object-cover flex-shrink-0"
        />
        <div class="min-w-0 flex-1">
          <div class="text-xs sm:text-sm text-gray-300">Người chơi</div>
          <div class="text-xs text-gray-400 truncate">
            Cấp {{ character.realm_level }} |
            {{ getRealmCategory(character.realm_level) }}
          </div>
        </div>
      </div>

      <!-- Center: Currencies - Hidden on small mobile, show on larger -->
      <div class="hidden md:flex items-center gap-2 lg:gap-4">
        <div class="text-xs">
          <div class="text-gray-400">Tiên Ngọc:</div>
          <div class="text-yellow-400 font-semibold">
            {{ formatNumber(getCurrency("immortal_jade")) }}
          </div>
        </div>
        <div class="text-xs">
          <div class="text-gray-400">Tiên Ngọc khoá:</div>
          <div class="text-yellow-400 font-semibold">
            {{ formatNumber(getCurrency("immortal_jade_locked")) }}
          </div>
        </div>
        <div class="text-xs">
          <div class="text-gray-400">Linh Thạch:</div>
          <div class="text-blue-400 font-semibold">
            {{ formatNumber(getCurrency("ling_stone")) }}
          </div>
        </div>
        <div class="text-xs">
          <div class="text-gray-400">Nguyên Thạch:</div>
          <div class="text-purple-400 font-semibold">
            {{ formatNumber(100) }}
          </div>
        </div>
      </div>

      <!-- Mobile: Simplified currencies -->
      <div
        class="flex md:hidden items-center gap-2 overflow-x-auto scrollbar-hide"
      >
        <div class="text-xs whitespace-nowrap">
          <span class="text-gray-400">Tiên Ngọc:</span>
          <span class="text-yellow-400 font-semibold ml-1">{{
            formatNumber(getCurrency("immortal_jade"))
          }}</span>
        </div>
        <div class="text-xs whitespace-nowrap">
          <span class="text-gray-400">Tiên Ngọc khoá:</span>
          <span class="text-yellow-400 font-semibold ml-1">{{
            formatNumber(getCurrency("immortal_jade_locked"))
          }}</span>
        </div>
        <div class="text-xs whitespace-nowrap">
          <span class="text-gray-400">💎</span>
          <span class="text-blue-400 font-semibold ml-1">{{
            formatNumber(getCurrency("ling_stone"))
          }}</span>
        </div>
        <div class="text-xs whitespace-nowrap">
          <span class="text-gray-400">💜</span>
          <span class="text-purple-400 font-semibold ml-1">{{
            formatNumber(100)
          }}</span>
        </div>
      </div>

      <!-- Right: Current Stage & Collapse Button -->
      <div
        class="flex items-center justify-between sm:justify-end gap-2 sm:gap-3"
      >
        <div class="text-left sm:text-right">
          <div class="text-xs text-gray-400">Cảnh giới</div>
          <div class="text-sm sm:text-lg font-bold text-purple-400">
            {{ realmDisplay }}
          </div>
        </div>
        <button
          class="text-xs bg-gray-800 hover:bg-gray-700 px-2 sm:px-3 py-1 rounded border border-gray-600 flex-shrink-0"
        >
          Thu Gọn
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatNumber } from "../../utils/formatNumber";
import characterImageSrc from "../../assets/nhanvatngoithien1-removebg-preview.png";

interface Character {
  realm_level: number;
}

interface Currency {
  currency_type: string;
  amount: number;
}

const props = defineProps<{
  character: Character;
  currencies: Currency[];
  realmDisplay: string;
}>();

const characterImage = characterImageSrc;

const getRealmCategory = (realmLevel: number): string => {
  if (realmLevel <= 10) return "Phàm cảnh";
  if (realmLevel <= 20) return "Tiên cảnh";
  if (realmLevel <= 30) return "Thánh cảnh";
  return "Thần cảnh";
};

const getCurrency = (type: string): number => {
  const currency = props.currencies.find((c) => c.currency_type === type);
  return currency?.amount || 0;
};
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
