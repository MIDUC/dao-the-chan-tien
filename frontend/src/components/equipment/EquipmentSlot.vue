<template>
  <div
    class="equipment-slot border-2 rounded-lg p-3 min-h-[120px] flex flex-col items-center justify-center transition-all"
    :class="
      equipment
        ? 'border-yellow-500 bg-yellow-500/10'
        : disabled
          ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
          : 'border-gray-600 bg-gray-800/30 hover:border-gray-500 cursor-pointer'
    "
    @click="!disabled && !equipment && $emit('open-inventory')"
  >
    <div v-if="equipment" class="w-full">
      <div class="text-center mb-2">
        <img
          v-if="equipment.item.icon_url"
          :src="equipment.item.icon_url"
          :alt="equipment.item.name"
          class="w-12 h-12 mx-auto mb-1"
        />
        <div class="text-xs text-gray-300 font-semibold truncate">
          {{ equipment.item.name }}
        </div>
      </div>
      <button
        @click.stop="$emit('unequip', slot)"
        class="w-full mt-2 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
      >
        Gỡ
      </button>
    </div>
    <div v-else class="text-center text-gray-500">
      <div class="text-2xl mb-1">{{ icon }}</div>
      <div class="text-xs">{{ label }}</div>
      <div v-if="disabled" class="text-xs text-red-400 mt-1">
        Cần level {{ requiredLevel }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Equipment {
  id: number;
  slot: string;
  item: {
    id: number;
    name: string;
    icon_url?: string;
  };
}

const props = defineProps<{
  slot: string;
  label: string;
  equipment?: Equipment;
  characterId: number;
  disabled?: boolean;
  requiredLevel?: number;
}>();

const emit = defineEmits<{
  equip: [inventoryId: number, slot: string];
  unequip: [slot: string];
  'open-inventory': [];
}>();

const icon = computed(() => {
  const slotIcons: Record<string, string> = {
    weapon_1: '⚔️',
    weapon_2: '⚔️',
    armor: '🛡️',
    helmet: '👑',
    boots: '👢',
    bracelet_1: '💍',
    bracelet_2: '💍',
    ring_1: '💎',
    ring_2: '💎',
    ring_3: '💎',
    ring_4: '💎',
  };
  return slotIcons[props.slot] || '📦';
});
</script>

