<template>
  <div class="equipment-paper-doll w-full p-3">
    <h2 class="text-xl font-bold text-gray-200 mb-4 text-center">
      Trang Bị Nhân Vật
    </h2>

    <div class="flex flex-col md:flex-row items-center justify-center gap-3">
      <!-- Character Display (Center) -->
      <div class="character-display relative">
        <div
          class="w-40 h-52 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border-2 border-yellow-500/30 flex items-center justify-center shadow-lg overflow-hidden"
        >
          <!-- Character Avatar/Image -->
          <div v-if="characterAvatar" class="w-full h-full">
            <img
              :src="characterAvatar"
              :alt="characterName"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            v-else
            class="text-center w-full h-full flex flex-col items-center justify-center"
          >
            <div class="text-4xl mb-1">🧘</div>
            <div class="text-sm font-semibold text-gray-200">
              {{ characterName }}
            </div>
            <div class="text-xs text-gray-400">{{ realmDisplay }}</div>
          </div>
        </div>
      </div>

      <!-- Equipment Slots Grid -->
      <div class="equipment-slots-grid grid grid-cols-3 gap-2">
        <!-- Row 1: Helmet -->
        <div class="col-start-2">
          <EquipmentSlotCard
            :slot="'helmet'"
            :label="'Mũ'"
            :equipment="getEquipmentBySlot('helmet')"
            :character-id="characterId"
            @equip="handleEquip"
            @unequip="handleUnequip"
          />
        </div>

        <!-- Row 2: Necklace, Character (center), Artifacts -->
        <div class="col-start-1">
          <EquipmentSlotCard
            :slot="'bracelet_1'"
            :label="'Vòng 1'"
            :equipment="getEquipmentBySlot('bracelet_1')"
            :character-id="characterId"
            @equip="handleEquip"
            @unequip="handleUnequip"
          />
        </div>
        <div class="col-start-2">
          <!-- Character center - already shown above, this is just spacing -->
        </div>
        <div class="col-start-3">
          <EquipmentSlotCard
            :slot="'bracelet_2'"
            :label="'Vòng 2'"
            :equipment="getEquipmentBySlot('bracelet_2')"
            :character-id="characterId"
            @equip="handleEquip"
            @unequip="handleUnequip"
          />
        </div>

        <!-- Row 3: Weapons -->
        <div class="col-start-1">
          <EquipmentSlotCard
            :slot="'weapon_1'"
            :label="'Vũ Khí 1'"
            :equipment="getEquipmentBySlot('weapon_1')"
            :character-id="characterId"
            @equip="handleEquip"
            @unequip="handleUnequip"
          />
        </div>
        <div class="col-start-2">
          <EquipmentSlotCard
            :slot="'armor'"
            :label="'Giáp'"
            :equipment="getEquipmentBySlot('armor')"
            :character-id="characterId"
            @equip="handleEquip"
            @unequip="handleUnequip"
          />
        </div>
        <div class="col-start-3">
          <EquipmentSlotCard
            :slot="'weapon_2'"
            :label="'Vũ Khí 2'"
            :equipment="getEquipmentBySlot('weapon_2')"
            :character-id="characterId"
            @equip="handleEquip"
            @unequip="handleUnequip"
          />
        </div>

        <!-- Row 4: Rings -->
        <div class="col-start-1">
          <EquipmentSlotCard
            :slot="'ring_1'"
            :label="'Nhẫn 1'"
            :equipment="getEquipmentBySlot('ring_1')"
            :character-id="characterId"
            @equip="handleEquip"
            @unequip="handleUnequip"
          />
        </div>
        <div class="col-start-2">
          <EquipmentSlotCard
            :slot="'boots'"
            :label="'Giày'"
            :equipment="getEquipmentBySlot('boots')"
            :character-id="characterId"
            @equip="handleEquip"
            @unequip="handleUnequip"
          />
        </div>
        <div class="col-start-3">
          <EquipmentSlotCard
            :slot="'ring_2'"
            :label="'Nhẫn 2'"
            :equipment="getEquipmentBySlot('ring_2')"
            :character-id="characterId"
            @equip="handleEquip"
            @unequip="handleUnequip"
          />
        </div>

        <!-- Row 5: More Rings -->
        <div class="col-start-1">
          <EquipmentSlotCard
            :slot="'ring_3'"
            :label="'Nhẫn 3'"
            :equipment="getEquipmentBySlot('ring_3')"
            :character-id="characterId"
            @equip="handleEquip"
            @unequip="handleUnequip"
          />
        </div>
        <div class="col-start-2"></div>
        <div class="col-start-3">
          <EquipmentSlotCard
            :slot="'ring_4'"
            :label="'Nhẫn 4'"
            :equipment="getEquipmentBySlot('ring_4')"
            :character-id="characterId"
            @equip="handleEquip"
            @unequip="handleUnequip"
          />
        </div>
      </div>
    </div>

    <!-- Pháp Bảo Section -->
    <div class="mt-6 space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-gray-300">Pháp Bảo</h3>
        <span class="text-xs text-gray-400">
          Đã mở: {{ availableArtifactSlots }}/10
        </span>
      </div>

      <div class="grid grid-cols-5 md:grid-cols-10 gap-1.5">
        <EquipmentSlotCard
          v-for="i in 10"
          :key="`artifact_${i}`"
          :slot="`artifact_${i}`"
          :label="`PB${i}`"
          :equipment="getEquipmentBySlot(`artifact_${i}`)"
          :character-id="characterId"
          :disabled="i > availableArtifactSlots"
          :required-level="30 + i"
          @equip="handleEquip"
          @unequip="handleUnequip"
        />
      </div>
    </div>

    <!-- Cổ Bảo Section -->
    <div class="mt-6 space-y-3">
      <h3 class="text-base font-semibold text-gray-300">
        Cổ Bảo (Không giới hạn)
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <AncientArtifactCard
          v-for="artifact in artifacts"
          :key="artifact.id"
          :artifact="artifact"
          :character-id="characterId"
          @unequip="handleUnequipArtifact"
        />

        <div
          class="border-2 border-dashed border-gray-600 rounded-lg p-3 text-center text-gray-500 hover:border-gray-500 transition-colors cursor-pointer"
          @click="showArtifactEquipModal = true"
        >
          <div class="text-3xl mb-1">+</div>
          <div class="text-xs">Thêm Cổ Bảo</div>
        </div>
      </div>
    </div>

    <!-- Modal để chọn cổ bảo từ inventory -->
    <ArtifactEquipModal
      :show="showArtifactEquipModal"
      :character-id="characterId"
      @close="showArtifactEquipModal = false"
      @equipped="handleArtifactEquipped"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { api } from "../../composables/useApi";
import { useCharacter } from "../../composables/useCharacter";
import EquipmentSlotCard from "./EquipmentSlotCard.vue";
import AncientArtifactCard from "./AncientArtifactCard.vue";
import ArtifactEquipModal from "./ArtifactEquipModal.vue";

interface Equipment {
  id: number;
  slot: string;
  item: {
    id: number;
    name: string;
    icon_url?: string;
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

const { character, realmDisplay } = useCharacter();
const equipment = ref<Equipment[]>([]);
const artifacts = ref<AncientArtifact[]>([]);
const availableArtifactSlots = ref(0);
const showArtifactEquipModal = ref(false);

const characterName = computed(
  () => character.value?.display_name || "Nhân Vật"
);
const characterAvatar = computed(() => {
  // Get avatar from character entity or use default
  // You can add avatar_url field to Character entity later
  return (character.value as any)?.avatar_url || null;
});

const getEquipmentBySlot = (slot: string): Equipment | undefined => {
  return equipment.value.find((eq) => eq.slot === slot);
};

const fetchEquipment = async () => {
  try {
    const response = await api.get(`/equipment/character/${props.characterId}`);
    equipment.value = response.data || [];
  } catch (error) {
    console.error("Error fetching equipment:", error);
  }
};

const fetchArtifacts = async () => {
  try {
    const response = await api.get(
      `/equipment/character/${props.characterId}/artifacts`
    );
    artifacts.value = response.data || [];
  } catch (error) {
    console.error("Error fetching artifacts:", error);
  }
};

const fetchArtifactSlots = async () => {
  try {
    const response = await api.get(
      `/equipment/character/${props.characterId}/artifact-slots`
    );
    availableArtifactSlots.value = response.data.availableSlots || 0;
  } catch (error) {
    console.error("Error fetching artifact slots:", error);
  }
};

const handleEquip = async (inventoryId: number, slot: string) => {
  try {
    const response = await api.post("/equipment/equip", {
      inventoryId,
      slot,
    });
    if (response.data.success) {
      await fetchEquipment();
    }
  } catch (error) {
    console.error("Error equipping item:", error);
  }
};

const handleUnequip = async (slot: string) => {
  try {
    const response = await api.delete(`/equipment/unequip/${slot}`);
    console.log("Unequip response:", response.data);

    if (response.data.success) {
      // Refresh equipment list
      await fetchEquipment();
      // Note: Item will be automatically added back to inventory by backend
      // Frontend inventory will be refreshed when user navigates to inventory tab
    } else {
      alert(response.data.message || "Không thể gỡ trang bị");
    }
  } catch (error: any) {
    console.error("Error unequipping item:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Có lỗi xảy ra khi gỡ trang bị";
    alert(errorMessage);
  }
};

const handleArtifactEquipped = async () => {
  await fetchArtifacts();
  showArtifactEquipModal.value = false;
};

const handleUnequipArtifact = async (artifactId: number) => {
  try {
    const response = await api.delete(
      `/equipment/unequip-artifact/${artifactId}`
    );
    if (response.data.success) {
      await fetchArtifacts();
    }
  } catch (error) {
    console.error("Error unequipping artifact:", error);
  }
};

onMounted(async () => {
  await Promise.all([fetchEquipment(), fetchArtifacts(), fetchArtifactSlots()]);
});
</script>

<style scoped>
.equipment-paper-doll {
  background: rgba(17, 24, 39, 0.5);
  border-radius: 8px;
}

.character-display {
  position: relative;
}

.equipment-slots-grid {
  min-width: 300px;
}
</style>
