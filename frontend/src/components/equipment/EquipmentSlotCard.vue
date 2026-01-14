<template>
  <div
    class="equipment-slot-card border-2 rounded-lg p-1 min-h-[60px] w-[60px] flex flex-col items-center justify-center transition-all cursor-pointer"
    :class="
      equipment
        ? 'border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20'
        : disabled
          ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
          : 'border-gray-600 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-800/50'
    "
    @click="!disabled && !equipment && handleClick"
  >
    <div v-if="equipment" class="w-full text-center">
      <div class="text-[8px] text-gray-300 font-semibold truncate mb-1">
        {{ equipment.item.name }}
      </div>
      <button
        @click.stop="$emit('unequip', slot)"
        class="w-full px-1 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[8px] rounded transition-colors"
      >
        Gỡ
      </button>
    </div>
    <div v-else class="text-center text-gray-500">
      <div class="text-2xl mb-0.5">+</div>
      <div class="text-[8px]">{{ label }}</div>
      <div v-if="disabled" class="text-[7px] text-red-400 mt-0.5">
        Lv.{{ requiredLevel }}
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
    artifact_1: '✨',
    artifact_2: '✨',
    artifact_3: '✨',
    artifact_4: '✨',
    artifact_5: '✨',
    artifact_6: '✨',
    artifact_7: '✨',
    artifact_8: '✨',
    artifact_9: '✨',
    artifact_10: '✨',
  };
  return slotIcons[props.slot] || '📦';
});

const handleClick = () => {
  // TODO: Open inventory modal to select item
  // For now, just emit event
  emit('equip', 0, props.slot);
};
</script>

