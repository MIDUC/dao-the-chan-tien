<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-gray-200">Chọn Vị Trí Trang Bị</h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div class="mb-4">
        <div class="text-sm text-gray-400 mb-2">Vật phẩm:</div>
        <div class="text-lg font-semibold text-gray-200">{{ item.name }}</div>
        <div v-if="item.equipment_slot" class="text-sm text-gray-400 mt-1">
          Loại: {{ getSlotLabel(item.equipment_slot) }}
        </div>
      </div>

      <div class="space-y-2">
        <div class="text-sm text-gray-400 mb-2">Chọn vị trí trang bị:</div>
        
        <!-- Weapon Slots -->
        <div v-if="item.equipment_slot?.startsWith('weapon') || !item.equipment_slot" class="space-y-2">
          <button
            v-for="slot in ['weapon_1', 'weapon_2']"
            :key="slot"
            @click="handleEquip(slot)"
            class="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-left"
          >
            {{ getSlotLabel(slot) }}
          </button>
        </div>

        <!-- Armor Slot -->
        <button
          v-if="item.equipment_slot === 'armor' || !item.equipment_slot"
          @click="handleEquip('armor')"
          class="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-left"
        >
          Giáp
        </button>

        <!-- Helmet Slot -->
        <button
          v-if="item.equipment_slot === 'helmet' || !item.equipment_slot"
          @click="handleEquip('helmet')"
          class="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-left"
        >
          Mũ
        </button>

        <!-- Boots Slot -->
        <button
          v-if="item.equipment_slot === 'boots' || !item.equipment_slot"
          @click="handleEquip('boots')"
          class="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-left"
        >
          Giày
        </button>

        <!-- Bracelet Slots -->
        <div v-if="item.equipment_slot?.startsWith('bracelet') || !item.equipment_slot" class="space-y-2">
          <button
            v-for="slot in ['bracelet_1', 'bracelet_2']"
            :key="slot"
            @click="handleEquip(slot)"
            class="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-left"
          >
            {{ getSlotLabel(slot) }}
          </button>
        </div>

        <!-- Ring Slots -->
        <div v-if="item.equipment_slot?.startsWith('ring') || !item.equipment_slot" class="space-y-2">
          <button
            v-for="slot in ['ring_1', 'ring_2', 'ring_3', 'ring_4']"
            :key="slot"
            @click="handleEquip(slot)"
            class="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-left"
          >
            {{ getSlotLabel(slot) }}
          </button>
        </div>

        <!-- Artifact Slots (if available) -->
        <div v-if="item.equipment_slot?.startsWith('artifact') || (!item.equipment_slot && availableArtifactSlots > 0)" class="space-y-2">
          <div class="text-xs text-gray-500 mb-1">Pháp Bảo (Đã mở: {{ availableArtifactSlots }}/10)</div>
          <button
            v-for="i in availableArtifactSlots"
            :key="`artifact_${i}`"
            @click="handleEquip(`artifact_${i}`)"
            class="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-left"
          >
            Pháp Bảo {{ i }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { api } from '../../composables/useApi';

interface Item {
  id: number;
  name: string;
  equipment_slot?: string | null;
}

const props = defineProps<{
  show: boolean;
  item: Item;
  inventoryId: number;
  characterId: number;
}>();

const emit = defineEmits<{
  close: [];
  equipped: [];
}>();

const availableArtifactSlots = ref(0);

const getSlotLabel = (slot: string): string => {
  const labels: Record<string, string> = {
    weapon_1: 'Vũ Khí 1',
    weapon_2: 'Vũ Khí 2',
    armor: 'Giáp',
    helmet: 'Mũ',
    boots: 'Giày',
    bracelet_1: 'Vòng 1',
    bracelet_2: 'Vòng 2',
    ring_1: 'Nhẫn 1',
    ring_2: 'Nhẫn 2',
    ring_3: 'Nhẫn 3',
    ring_4: 'Nhẫn 4',
    artifact_1: 'Pháp Bảo 1',
    artifact_2: 'Pháp Bảo 2',
    artifact_3: 'Pháp Bảo 3',
    artifact_4: 'Pháp Bảo 4',
    artifact_5: 'Pháp Bảo 5',
    artifact_6: 'Pháp Bảo 6',
    artifact_7: 'Pháp Bảo 7',
    artifact_8: 'Pháp Bảo 8',
    artifact_9: 'Pháp Bảo 9',
    artifact_10: 'Pháp Bảo 10',
  };
  return labels[slot] || slot;
};

// Calculate available slots based on item's equipment_slot
const availableSlots = computed(() => {
  const slots: string[] = [];
  
  if (!props.item.equipment_slot) {
    // If no equipment_slot specified, show all slots
    slots.push('weapon_1', 'weapon_2', 'armor', 'helmet', 'boots', 'bracelet_1', 'bracelet_2', 'ring_1', 'ring_2', 'ring_3', 'ring_4');
    // Add artifact slots if available
    for (let i = 1; i <= availableArtifactSlots.value; i++) {
      slots.push(`artifact_${i}`);
    }
    return slots;
  }
  
  const itemSlot = props.item.equipment_slot;
  const itemSlotParts = itemSlot.split('_');
  
  // If item has specific slot (e.g., 'weapon_1'), only show that slot
  if (itemSlotParts.length > 1) {
    slots.push(itemSlot);
    return slots;
  }
  
  // If item has generic slot (e.g., 'weapon'), show all slots of that type
  const slotType = itemSlotParts[0];
  
  switch (slotType) {
    case 'weapon':
      slots.push('weapon_1', 'weapon_2');
      break;
    case 'armor':
      slots.push('armor');
      break;
    case 'helmet':
      slots.push('helmet');
      break;
    case 'boots':
      slots.push('boots');
      break;
    case 'bracelet':
      slots.push('bracelet_1', 'bracelet_2');
      break;
    case 'ring':
      slots.push('ring_1', 'ring_2', 'ring_3', 'ring_4');
      break;
    case 'artifact':
      for (let i = 1; i <= availableArtifactSlots.value; i++) {
        slots.push(`artifact_${i}`);
      }
      break;
  }
  
  return slots;
});

const handleEquip = async (slot: string) => {
  try {
    console.log('Equip request - characterId:', props.characterId);
    console.log('Equip request - inventoryId:', props.inventoryId);
    console.log('Equip request - slot:', slot);
    
    const response = await api.post('/equipment/equip', {
      inventoryId: props.inventoryId,
      slot,
      characterId: props.characterId,
    });
    
    console.log('Equip response:', response.data);
    
    if (response.data.success) {
      emit('equipped');
      emit('close');
    } else {
      alert(response.data.message || 'Không thể trang bị vật phẩm');
    }
  } catch (error: any) {
    console.error('Error equipping item:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi trang bị';
    alert(errorMessage);
  }
};

const fetchArtifactSlots = async () => {
  try {
    const response = await api.get(`/equipment/character/${props.characterId}/artifact-slots`);
    availableArtifactSlots.value = response.data.availableSlots || 0;
  } catch (error) {
    console.error('Error fetching artifact slots:', error);
  }
};

onMounted(() => {
  if (props.show) {
    fetchArtifactSlots();
  }
});

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      fetchArtifactSlots();
    }
  }
);
</script>

