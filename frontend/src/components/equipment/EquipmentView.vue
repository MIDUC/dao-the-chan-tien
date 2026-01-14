<template>
  <div class="equipment-view w-full p-4 space-y-6">
    <!-- Tabs -->
    <div class="flex gap-2 mb-4 border-b border-gray-700">
      <button
        @click="activeTab = 'paper-doll'"
        class="px-4 py-2 font-semibold transition-colors"
        :class="
          activeTab === 'paper-doll'
            ? 'text-yellow-400 border-b-2 border-yellow-400'
            : 'text-gray-400 hover:text-gray-300'
        "
      >
        Nhân Vật
      </button>
      <button
        @click="activeTab = 'list'"
        class="px-4 py-2 font-semibold transition-colors"
        :class="
          activeTab === 'list'
            ? 'text-yellow-400 border-b-2 border-yellow-400'
            : 'text-gray-400 hover:text-gray-300'
        "
      >
        Danh Sách
      </button>
    </div>

    <!-- Paper Doll View -->
    <EquipmentPaperDoll
      v-if="activeTab === 'paper-doll'"
      :character-id="characterId"
    />

    <!-- List View -->
    <div v-else class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-200 mb-4">Trang Bị</h2>

    <!-- Regular Equipment Slots -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-300">Trang Bị Thường</h3>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Vũ khí 1 -->
        <EquipmentSlot
          :slot="'weapon_1'"
          :label="'Vũ Khí 1'"
          :equipment="getEquipmentBySlot('weapon_1')"
          :character-id="characterId"
          @equip="handleEquip"
          @unequip="handleUnequip"
        />
        
        <!-- Vũ khí 2 -->
        <EquipmentSlot
          :slot="'weapon_2'"
          :label="'Vũ Khí 2'"
          :equipment="getEquipmentBySlot('weapon_2')"
          :character-id="characterId"
          @equip="handleEquip"
          @unequip="handleUnequip"
        />
        
        <!-- Giáp -->
        <EquipmentSlot
          :slot="'armor'"
          :label="'Giáp'"
          :equipment="getEquipmentBySlot('armor')"
          :character-id="characterId"
          @equip="handleEquip"
          @unequip="handleUnequip"
        />
        
        <!-- Mũ -->
        <EquipmentSlot
          :slot="'helmet'"
          :label="'Mũ'"
          :equipment="getEquipmentBySlot('helmet')"
          :character-id="characterId"
          @equip="handleEquip"
          @unequip="handleUnequip"
        />
        
        <!-- Giày -->
        <EquipmentSlot
          :slot="'boots'"
          :label="'Giày'"
          :equipment="getEquipmentBySlot('boots')"
          :character-id="characterId"
          @equip="handleEquip"
          @unequip="handleUnequip"
        />
        
        <!-- Vòng 1 -->
        <EquipmentSlot
          :slot="'bracelet_1'"
          :label="'Vòng 1'"
          :equipment="getEquipmentBySlot('bracelet_1')"
          :character-id="characterId"
          @equip="handleEquip"
          @unequip="handleUnequip"
        />
        
        <!-- Vòng 2 -->
        <EquipmentSlot
          :slot="'bracelet_2'"
          :label="'Vòng 2'"
          :equipment="getEquipmentBySlot('bracelet_2')"
          :character-id="characterId"
          @equip="handleEquip"
          @unequip="handleUnequip"
        />
        
        <!-- Nhẫn 1-4 -->
        <EquipmentSlot
          v-for="i in 4"
          :key="`ring_${i}`"
          :slot="`ring_${i}`"
          :label="`Nhẫn ${i}`"
          :equipment="getEquipmentBySlot(`ring_${i}`)"
          :character-id="characterId"
          @equip="handleEquip"
          @unequip="handleUnequip"
        />
      </div>
    </div>

    <!-- Pháp Bảo Slots (mở từ Nguyên Anh) -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-300">Pháp Bảo</h3>
        <span class="text-sm text-gray-400">
          Đã mở: {{ availableArtifactSlots }}/10
        </span>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <EquipmentSlot
          v-for="i in 10"
          :key="`artifact_${i}`"
          :slot="`artifact_${i}`"
          :label="`Pháp Bảo ${i}`"
          :equipment="getEquipmentBySlot(`artifact_${i}`)"
          :character-id="characterId"
          :disabled="i > availableArtifactSlots"
          :required-level="30 + i"
          @equip="handleEquip"
          @unequip="handleUnequip"
        />
      </div>
    </div>

    <!-- Cổ Bảo (Ancient Artifacts) -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-300">Cổ Bảo (Không giới hạn)</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AncientArtifactCard
          v-for="artifact in artifacts"
          :key="artifact.id"
          :artifact="artifact"
          :character-id="characterId"
          @unequip="handleUnequipArtifact"
        />
        
        <!-- Empty slot để thêm cổ bảo -->
        <div
          class="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center text-gray-500 hover:border-gray-500 transition-colors cursor-pointer"
          @click="showArtifactEquipModal = true"
        >
          <div class="text-4xl mb-2">+</div>
          <div class="text-sm">Thêm Cổ Bảo</div>
        </div>
      </div>
    </div>

      <!-- Modal để chọn cổ bảo từ inventory -->
      <ArtifactEquipModal
        v-if="showArtifactEquipModal"
        :character-id="characterId"
        @close="showArtifactEquipModal = false"
        @equipped="handleArtifactEquipped"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '../../composables/useApi';
import EquipmentSlot from './EquipmentSlot.vue';
import EquipmentPaperDoll from './EquipmentPaperDoll.vue';
import AncientArtifactCard from './AncientArtifactCard.vue';
import ArtifactEquipModal from './ArtifactEquipModal.vue';

interface Equipment {
  id: number;
  slot: string;
  item: {
    id: number;
    name: string;
    icon_url?: string;
    equipment_stats?: any;
  };
}

interface AncientArtifact {
  id: number;
  item: {
    id: number;
    name: string;
    icon_url?: string;
  };
  stats?: any;
  effects?: any;
  penalties?: any;
}

const props = defineProps<{
  characterId: number;
}>();

const activeTab = ref<'paper-doll' | 'list'>('paper-doll');
const equipment = ref<Equipment[]>([]);
const artifacts = ref<AncientArtifact[]>([]);
const availableArtifactSlots = ref(0);
const showArtifactEquipModal = ref(false);

const getEquipmentBySlot = (slot: string): Equipment | undefined => {
  return equipment.value.find((eq) => eq.slot === slot);
};

const fetchEquipment = async () => {
  try {
    const response = await api.get(`/equipment/character/${props.characterId}`);
    equipment.value = response.data || [];
  } catch (error) {
    console.error('Error fetching equipment:', error);
  }
};

const fetchArtifacts = async () => {
  try {
    const response = await api.get(`/equipment/character/${props.characterId}/artifacts`);
    artifacts.value = response.data || [];
  } catch (error) {
    console.error('Error fetching artifacts:', error);
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

const handleEquip = async (inventoryId: number, slot: string) => {
  try {
    const response = await api.post('/equipment/equip', {
      inventoryId,
      slot,
    });
    if (response.data.success) {
      await fetchEquipment();
    }
  } catch (error) {
    console.error('Error equipping item:', error);
  }
};

const handleUnequip = async (slot: string) => {
  try {
    const response = await api.delete(`/equipment/unequip/${slot}`);
    if (response.data.success) {
      await fetchEquipment();
    }
  } catch (error) {
    console.error('Error unequipping item:', error);
  }
};

const handleArtifactEquipped = async () => {
  await fetchArtifacts();
  showArtifactEquipModal.value = false;
};

const handleUnequipArtifact = async (artifactId: number) => {
  try {
    const response = await api.delete(`/equipment/unequip-artifact/${artifactId}`);
    if (response.data.success) {
      await fetchArtifacts();
    }
  } catch (error) {
    console.error('Error unequipping artifact:', error);
  }
};

onMounted(async () => {
  await Promise.all([
    fetchEquipment(),
    fetchArtifacts(),
    fetchArtifactSlots(),
  ]);
});
</script>

<style scoped>
.equipment-view {
  background: rgba(17, 24, 39, 0.5);
  border-radius: 8px;
}
</style>

