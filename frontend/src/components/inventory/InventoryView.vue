<template>
  <div class="w-full h-full flex gap-4 p-4">
    <!-- Inventory Grid - 2/3 width -->
    <div class="w-2/3">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-dao-gold">Túi Đồ</h2>
        <div class="text-sm text-gray-400">
          {{ usedSlots }} / {{ maxSlots }} ô
        </div>
      </div>

      <div v-if="loading" class="text-gray-400 animate-pulse">Đang tải...</div>

      <div v-else class="space-y-4">
        <div class="grid grid-cols-5 gap-2">
          <div
            v-for="(slot, index) in inventorySlots"
            :key="index"
            @click="selectSlot(slot)"
            class="aspect-square bg-gray-700/50 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-700/70 relative"
            :class="[
              slot.inventoryItem
                ? getRaritySlotClass(
                    slot.inventoryItem.item.rarity,
                    selectedSlot?.slotIndex === index
                  )
                : selectedSlot?.slotIndex === index
                ? 'border-cyan-300 shadow-lg shadow-cyan-300/30'
                : 'border-gray-600',
            ]"
            :style="
              slot.inventoryItem
                ? getRarityGlowStyle(
                    slot.inventoryItem.item.rarity,
                    selectedSlot?.slotIndex === index
                  )
                : ''
            "
          >
            <!-- Item in slot -->
            <div
              v-if="slot.inventoryItem"
              class="w-full h-full flex flex-col items-center justify-center p-1 relative"
            >
              <!-- Item image -->
              <img
                v-if="getItemImageUrl(slot.inventoryItem.item)"
                :src="getItemImageUrl(slot.inventoryItem.item)"
                :alt="slot.inventoryItem.item.name"
                class="w-full h-full object-contain rounded"
                @error="handleImageError"
              />
              <!-- Fallback icon if image fails to load -->
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-4xl"
                :class="getRarityColor(slot.inventoryItem.item.rarity)"
              >
                {{ getItemIcon(slot.inventoryItem.item) }}
              </div>

              <!-- Quantity badge -->
              <div
                v-if="slot.inventoryItem.quantity > 1"
                class="absolute bottom-0 right-0 bg-gray-900/90 text-white text-xs px-1.5 py-0.5 rounded-tl"
              >
                {{ slot.inventoryItem.quantity }}
              </div>

              <!-- Lock icon -->
              <div
                v-if="slot.locked"
                class="absolute top-1 right-1 text-gray-400 text-xs"
              >
                🔒
              </div>

              <!-- Arrow indicator -->
              <div
                v-if="slot.hasIndicator"
                class="absolute top-1 left-1 text-red-500 text-xs"
              >
                ⬇️
              </div>
            </div>

            <!-- Empty slot -->
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-gray-500 text-2xl"
            >
              <span v-if="slot.locked">🔒</span>
              <span v-else>+</span>
            </div>
          </div>
        </div>

        <!-- Expand Inventory Button -->
        <div class="mt-4 flex justify-center">
          <button
            @click="expandInventory"
            :disabled="expanding"
            class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
          >
            <span v-if="expanding">Đang xử lý...</span>
            <span v-else>Mở thêm 5 ô (50 Tiên Ngọc)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Item Info Panel - 1/3 width -->
    <div class="w-1/3">
      <div
        v-if="selectedSlot && selectedSlot.inventoryItem"
        class="bg-gray-800/80 border-2 border-cyan-300/50 rounded-lg p-4 h-full"
      >
        <h3 class="text-lg font-bold mb-4 text-cyan-200">
          {{ selectedSlot.inventoryItem.item.name }}
        </h3>

        <!-- Item Icon -->
        <div class="flex justify-center mb-4">
          <div
            class="w-24 h-24 flex items-center justify-center rounded-lg border-2 overflow-hidden relative"
            :class="getRarityBorder(selectedSlot.inventoryItem.item.rarity)"
            :style="getRarityGlowStyle(selectedSlot.inventoryItem.item.rarity)"
          >
            <img
              v-if="getItemImageUrl(selectedSlot.inventoryItem.item)"
              :src="getItemImageUrl(selectedSlot.inventoryItem.item)"
              :alt="selectedSlot.inventoryItem.item.name"
              class="w-full h-full object-contain"
              @error="handleImageError"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-6xl"
              :class="getRarityColor(selectedSlot.inventoryItem.item.rarity)"
            >
              {{ getItemIcon(selectedSlot.inventoryItem.item) }}
            </div>
          </div>
        </div>

        <!-- Item Details -->
        <div class="space-y-3 text-sm">
          <div>
            <span class="text-gray-400">Loại:</span>
            <span class="text-white ml-2">
              {{ getItemTypeLabel(selectedSlot.inventoryItem.item.item_type) }}
            </span>
          </div>

          <div>
            <span class="text-gray-400">Phẩm cấp:</span>
            <span class="text-white ml-2">
              {{ getRarityLabel(selectedSlot.inventoryItem.item.rarity) }}
            </span>
          </div>

          <div>
            <span class="text-gray-400">Số lượng:</span>
            <span class="text-white ml-2">
              {{ selectedSlot.inventoryItem.quantity }}
            </span>
          </div>

          <div v-if="selectedSlot.inventoryItem.item.description">
            <span class="text-gray-400 block mb-1">Mô tả:</span>
            <p class="text-gray-300 text-xs">
              {{ selectedSlot.inventoryItem.item.description }}
            </p>
          </div>

          <!-- Equipment Stats -->
          <div
            v-if="
              selectedSlot.inventoryItem.item.item_type === 'equipment' &&
              selectedSlot.inventoryItem.item.equipment_stats
            "
            class="mt-4 pt-4 border-t border-gray-700"
          >
            <div class="text-gray-400 mb-2">Thuộc tính:</div>
            <div class="space-y-1 text-xs">
              <div
                v-if="selectedSlot.inventoryItem.item.equipment_stats.strength"
                class="text-red-300"
              >
                Sức mạnh: +{{
                  selectedSlot.inventoryItem.item.equipment_stats.strength
                }}
              </div>
              <div
                v-if="selectedSlot.inventoryItem.item.equipment_stats.agility"
                class="text-green-300"
              >
                Nhanh nhẹn: +{{
                  selectedSlot.inventoryItem.item.equipment_stats.agility
                }}
              </div>
              <div
                v-if="selectedSlot.inventoryItem.item.equipment_stats.wisdom"
                class="text-blue-300"
              >
                Trí tuệ: +{{
                  selectedSlot.inventoryItem.item.equipment_stats.wisdom
                }}
              </div>
              <div
                v-if="selectedSlot.inventoryItem.item.equipment_stats.hp"
                class="text-yellow-300"
              >
                HP: +{{ selectedSlot.inventoryItem.item.equipment_stats.hp }}
              </div>
              <div
                v-if="selectedSlot.inventoryItem.item.equipment_stats.defense"
                class="text-purple-300"
              >
                Phòng thủ: +{{
                  selectedSlot.inventoryItem.item.equipment_stats.defense
                }}
              </div>
            </div>
          </div>

          <!-- Sell Price -->
          <div
            v-if="
              selectedSlot.inventoryItem.item.sellable &&
              selectedSlot.inventoryItem.item.sell_price > 0
            "
            class="mt-4 pt-4 border-t border-gray-700"
          >
            <div class="text-gray-400">Giá bán:</div>
            <div class="text-yellow-400 font-semibold">
              {{
                formatNumber(selectedSlot.inventoryItem.item.sell_price)
              }}
              Linh Thạch
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-4 pt-4 border-t border-gray-700 space-y-2">
            <!-- Equip Button for Equipment -->
            <button
              v-if="selectedSlot.inventoryItem.item.item_type === 'equipment'"
              @click="showEquipModal = true"
              class="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-semibold"
            >
              Trang Bị
            </button>

            <!-- Use Button for Consumables -->
            <button
              v-else-if="
                selectedSlot.inventoryItem.item.item_type === 'consumable' &&
                selectedSlot.inventoryItem.item.usable
              "
              @click="useItem"
              class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
            >
              Sử Dụng
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="bg-gray-800/50 border-2 border-gray-700 rounded-lg p-4 h-full flex items-center justify-center"
      >
        <p class="text-gray-500 text-center">
          Chọn một vật phẩm để xem thông tin
        </p>
      </div>
    </div>

    <!-- Equip Modal -->
    <EquipSlotModal
      v-if="showEquipModal && selectedSlot?.inventoryItem"
      :show="showEquipModal"
      :item="selectedSlot.inventoryItem.item"
      :inventory-id="selectedSlot.inventoryItem.id"
      :character-id="characterId"
      @close="showEquipModal = false"
      @equipped="handleEquipped"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { api } from "../../composables/useApi";
import { formatNumber } from "../../utils/formatNumber";
import EquipSlotModal from "./EquipSlotModal.vue";

interface Item {
  id: number;
  name: string;
  description: string | null;
  item_type: string;
  rarity: string;
  icon_url: string | null;
  quantity?: number;
  usable?: boolean;
  equipment_stats?: {
    strength?: number;
    agility?: number;
    wisdom?: number;
    hp?: number;
    defense?: number;
  };
  sellable: boolean;
  sell_price: number;
}

interface InventoryItem {
  id: number;
  character_id: number;
  item_id: number;
  quantity: number;
  slot_position: number | null;
  item: Item;
}

interface InventorySlot {
  slotIndex: number;
  inventoryItem: InventoryItem | null;
  locked: boolean;
  hasIndicator: boolean;
}

const props = defineProps<{
  characterId: number;
}>();

const loading = ref(true);
const expanding = ref(false);
const inventoryItems = ref<InventoryItem[]>([]);
const selectedSlot = ref<InventorySlot | null>(null);
const maxSlots = ref(20); // Default, will be fetched from character
const character = ref<any>(null);
const showEquipModal = ref(false);

// Calculate used slots
const usedSlots = computed(() => {
  return inventoryItems.value.length;
});

// Create slots based on max_inventory_slots
const inventorySlots = computed<InventorySlot[]>(() => {
  const slots: InventorySlot[] = [];

  for (let i = 0; i < maxSlots.value; i++) {
    const item = inventoryItems.value.find(
      (inv) =>
        inv.slot_position === i ||
        (!inv.slot_position && i === inventoryItems.value.indexOf(inv))
    );

    slots.push({
      slotIndex: i,
      inventoryItem: item || null,
      locked: false, // No longer locking slots, just show available ones
      hasIndicator: false, // Can be set based on item status
    });
  }

  return slots;
});

const fetchCharacter = async () => {
  try {
    const response = await api.get(`/characters/${props.characterId}`);
    character.value = response.data;
    maxSlots.value = character.value?.max_inventory_slots || 20;
  } catch (error) {
    console.error("Error fetching character:", error);
  }
};

const fetchInventory = async () => {
  try {
    loading.value = true;
    const response = await api.get(
      `/characters/${props.characterId}/inventory`
    );
    inventoryItems.value = response.data || [];
  } catch (error) {
    console.error("Error fetching inventory:", error);
    inventoryItems.value = [];
  } finally {
    loading.value = false;
  }
};

const useItem = async () => {
  if (!selectedSlot.value?.inventoryItem) return;

  try {
    const response = await api.post("/items/use", {
      inventoryId: selectedSlot.value.inventoryItem.id,
      quantity: 1,
    });

    if (response.data.success) {
      await fetchInventory();
      selectedSlot.value = null;
    }
  } catch (error) {
    console.error("Error using item:", error);
  }
};

const handleEquipped = async () => {
  // Refresh inventory to remove equipped item
  await fetchInventory();
  // Clear selection
  selectedSlot.value = null;
  showEquipModal.value = false;
};

const expandInventory = async () => {
  if (expanding.value) return;

  try {
    expanding.value = true;
    const response = await api.post(
      `/characters/${props.characterId}/inventory/expand`,
      {
        slotsToAdd: 5,
      }
    );

    if (response.data.success) {
      // Update max slots
      maxSlots.value = response.data.character.max_inventory_slots;
      alert(response.data.message);
    } else {
      alert(response.data.message || "Không thể mở rộng túi đồ");
    }
  } catch (error: any) {
    console.error("Error expanding inventory:", error);
    alert(error.response?.data?.message || "Có lỗi xảy ra khi mở rộng túi đồ");
  } finally {
    expanding.value = false;
  }
};

const selectSlot = (slot: InventorySlot) => {
  if (slot.locked || !slot.inventoryItem) {
    return;
  }
  selectedSlot.value = slot;
};

const getItemImageUrl = (item: Item): string | undefined => {
  if (!item.icon_url) {
    return undefined;
  }

  // If it's already a full URL, return it
  if (
    item.icon_url.startsWith("http://") ||
    item.icon_url.startsWith("https://")
  ) {
    return item.icon_url;
  }

  // If it's a relative path, construct full URL
  // Backend serves static files from /public/
  const apiBaseUrl = "http://localhost:3000";
  return `${apiBaseUrl}/public/items/${item.icon_url}`;
};

const handleImageError = (event: Event) => {
  // Hide broken image and show fallback
  const img = event.target as HTMLImageElement;
  if (img) {
    img.style.display = "none";
  }
};

const getItemIcon = (item: Item): string => {
  // Return emoji or icon based on item type (fallback)
  const iconMap: Record<string, string> = {
    consumable: "💊",
    equipment: "⚔️",
    material: "🌿",
    quest_item: "📜",
    special: "✨",
  };

  return iconMap[item.item_type] || "📦";
};

const getRarityColor = (rarity: string): string => {
  const colorMap: Record<string, string> = {
    common: "text-gray-300",
    uncommon: "text-green-300",
    rare: "text-blue-300",
    epic: "text-purple-300",
    legendary: "text-yellow-300",
    mythic: "text-orange-300",
  };
  return colorMap[rarity] || "text-gray-300";
};

const getRarityBorder = (rarity: string): string => {
  const borderMap: Record<string, string> = {
    common: "border-gray-400",
    uncommon: "border-green-400",
    rare: "border-blue-400",
    epic: "border-purple-400",
    legendary: "border-yellow-400",
    mythic: "border-red-400",
  };
  return borderMap[rarity] || "border-gray-400";
};

const getRaritySlotClass = (rarity: string, isSelected: boolean): string => {
  const baseClasses = "border-2 rounded-lg";
  const glowClasses: Record<string, string> = {
    common: isSelected
      ? "border-gray-300 shadow-lg shadow-gray-300/50"
      : "border-gray-400 shadow-md shadow-gray-400/30",
    uncommon: isSelected
      ? "border-green-400 shadow-lg shadow-green-400/50"
      : "border-green-500 shadow-md shadow-green-500/40",
    rare: isSelected
      ? "border-blue-400 shadow-lg shadow-blue-400/50"
      : "border-blue-500 shadow-md shadow-blue-500/40",
    epic: isSelected
      ? "border-purple-400 shadow-lg shadow-purple-400/50"
      : "border-purple-500 shadow-md shadow-purple-500/40",
    legendary: isSelected
      ? "border-yellow-400 shadow-lg shadow-yellow-400/60"
      : "border-yellow-500 shadow-md shadow-yellow-500/50",
    mythic: isSelected
      ? "border-red-400 shadow-lg shadow-red-400/60"
      : "border-red-500 shadow-md shadow-red-500/50",
  };
  return `${baseClasses} ${glowClasses[rarity] || glowClasses.common}`;
};

const getRarityGlowStyle = (
  rarity: string,
  isSelected: boolean = false
): string => {
  const intensity = isSelected ? 1.5 : 1;
  const glowMap: Record<string, string> = {
    common: `box-shadow: 0 0 ${10 * intensity}px rgba(156, 163, 175, ${
      0.3 * intensity
    }), inset 0 0 ${5 * intensity}px rgba(156, 163, 175, 0.2);`,
    uncommon: `box-shadow: 0 0 ${15 * intensity}px rgba(34, 197, 94, ${
      0.5 * intensity
    }), inset 0 0 ${8 * intensity}px rgba(34, 197, 94, 0.3);`,
    rare: `box-shadow: 0 0 ${15 * intensity}px rgba(59, 130, 246, ${
      0.5 * intensity
    }), inset 0 0 ${8 * intensity}px rgba(59, 130, 246, 0.3);`,
    epic: `box-shadow: 0 0 ${20 * intensity}px rgba(168, 85, 247, ${
      0.6 * intensity
    }), inset 0 0 ${10 * intensity}px rgba(168, 85, 247, 0.4);`,
    legendary: `box-shadow: 0 0 ${25 * intensity}px rgba(234, 179, 8, ${
      0.7 * intensity
    }), inset 0 0 ${12 * intensity}px rgba(234, 179, 8, 0.5);`,
    mythic: `box-shadow: 0 0 ${30 * intensity}px rgba(239, 68, 68, ${
      0.8 * intensity
    }), inset 0 0 ${15 * intensity}px rgba(239, 68, 68, 0.6);`,
  };
  return (glowMap[rarity] ?? glowMap.common) as string;
};

const getRarityLabel = (rarity: string): string => {
  const labelMap: Record<string, string> = {
    common: "Thường",
    uncommon: "Không thường",
    rare: "Hiếm",
    epic: "Sử thi",
    legendary: "Huyền thoại",
    mythic: "Thần thoại",
  };
  return labelMap[rarity] || rarity;
};

const getItemTypeLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    consumable: "Vật phẩm tiêu hao",
    equipment: "Trang bị",
    material: "Nguyên liệu",
    quest_item: "Vật phẩm nhiệm vụ",
    special: "Đặc biệt",
  };
  return labelMap[type] || type;
};

onMounted(async () => {
  await fetchCharacter();
  await fetchInventory();
});
</script>

<style scoped>
/* Additional styles if needed */
</style>
