<template>
  <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 transition-all relative overflow-hidden">
    <!-- Item Image with rarity frame -->
    <div 
      class="w-full aspect-square mb-3 bg-gray-900/50 rounded-lg border-2 flex items-center justify-center relative overflow-hidden"
      :class="getRarityBorderClass(shopItem.item?.rarity)"
      :style="getRarityGlowStyle(shopItem.item?.rarity)"
    >
      <img
        v-if="getItemImageUrl(shopItem.item)"
        :src="getItemImageUrl(shopItem.item)"
        :alt="getDisplayName(shopItem.item?.name)"
        class="w-full h-full object-contain p-2"
        @error="handleImageError"
      />
      <!-- Fallback icon if image fails to load -->
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-6xl"
        :class="getRarityColor(shopItem.item?.rarity)"
      >
        {{ getItemIcon(shopItem.item) }}
      </div>
    </div>

    <!-- Item Name (without suffix) -->
    <h3 class="font-bold text-white mb-1 text-sm">{{ getDisplayName(shopItem.item?.name) }}</h3>
    <p class="text-xs text-gray-400 mb-3 line-clamp-2">{{ shopItem.item?.description }}</p>
    
    <div class="flex items-center justify-between mb-3">
      <span class="text-yellow-400 font-bold text-sm" :title="shopItem.price.toLocaleString('vi-VN')">
        {{ formatNumber(shopItem.price) }} {{ getCurrencyName(shopItem.currency_type) }}
      </span>
      <span v-if="shopItem.stock !== null" class="text-xs text-gray-400">
        Còn: {{ formatNumber(shopItem.stock) }}
      </span>
    </div>
    
    <!-- Quantity selector for stackable items (materials) -->
    <div v-if="isStackable(shopItem.item)" class="mb-3 flex items-center gap-2">
      <label class="text-xs text-gray-400">Số lượng:</label>
      <div class="flex items-center gap-1">
        <button
          @click="decreaseQuantity"
          :disabled="quantity <= 1"
          class="w-6 h-6 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs"
        >
          -
        </button>
        <input
          v-model.number="quantity"
          type="number"
          min="1"
          :max="getMaxQuantity"
          class="w-12 h-6 bg-gray-700 text-white text-center text-xs rounded"
        />
        <button
          @click="increaseQuantity"
          :disabled="quantity >= getMaxQuantity"
          class="w-6 h-6 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs"
        >
          +
        </button>
      </div>
      <span class="text-xs text-gray-400">
        Tổng: {{ formatNumber(shopItem.price * quantity) }} {{ getCurrencyName(shopItem.currency_type) }}
      </span>
    </div>
    
    <button
      @click="$emit('buy-item', shopItem.id, quantity)"
      class="w-full bg-dao-qi hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition-colors"
    >
      Mua{{ isStackable(shopItem.item) ? ` (${quantity})` : '' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatNumber } from '../../utils/formatNumber';

interface Item {
  id: number;
  name: string;
  description: string;
  rarity?: string;
  icon_url?: string | null;
  item_type?: string;
}

interface ShopItem {
  id: number;
  shop_id: number;
  item_id: number;
  price: number;
  currency_type: string;
  stock: number | null;
  item?: Item;
}

const props = defineProps<{
  shopItem: ShopItem;
}>();

defineEmits<{
  'buy-item': [shopItemId: number, quantity: number];
}>();

const quantity = ref(1);

// Check if item is stackable (materials, consumables, but not equipment)
const isStackable = (item: Item | undefined): boolean => {
  if (!item?.item_type) return false;
  const type = item.item_type.toLowerCase();
  // Equipment cannot stack, everything else can
  return type !== 'equipment';
};

const getMaxQuantity = computed(() => {
  if (props.shopItem.stock !== null) {
    return Math.min(999, props.shopItem.stock);
  }
  return 999;
});

const increaseQuantity = () => {
  if (quantity.value < getMaxQuantity.value) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// Remove rarity suffix from item name (e.g., "Mộc Kiếm [Đỏ]" -> "Mộc Kiếm")
const getDisplayName = (name: string | undefined): string => {
  if (!name) return '';
  // Remove patterns like [Đỏ], [Vàng], [Tím], [Lam], [Lục], [Trắng]
  return name.replace(/\s*\[(Đỏ|Vàng|Tím|Lam|Lục|Trắng|Xám)\]\s*$/i, '').trim();
};

const getItemImageUrl = (item: Item | undefined): string | null => {
  if (!item?.icon_url) {
    return null;
  }

  // If it's already a full URL, return it
  if (item.icon_url.startsWith('http://') || item.icon_url.startsWith('https://')) {
    return item.icon_url;
  }

  // If it's a relative path, construct full URL
  const apiBaseUrl = 'http://localhost:3000';
  return `${apiBaseUrl}/public/items/${item.icon_url}`;
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
};

const getItemIcon = (item: Item | undefined): string => {
  if (!item) return '📦';
  const type = item.item_type?.toLowerCase() || '';
  if (type.includes('weapon') || type.includes('sword')) return '⚔️';
  if (type.includes('armor')) return '🛡️';
  if (type.includes('material')) return '💎';
  if (type.includes('consumable')) return '🧪';
  return '📦';
};

const getRarityColor = (rarity: string | undefined): string => {
  if (!rarity) return 'text-gray-400';
  const colorMap: Record<string, string> = {
    common: 'text-gray-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400',
    mythic: 'text-red-400',
  };
  return colorMap[rarity.toLowerCase()] || 'text-gray-400';
};

const getRarityBorderClass = (rarity: string | undefined): string => {
  if (!rarity) return 'border-gray-700';
  const borderMap: Record<string, string> = {
    common: 'border-gray-600',
    uncommon: 'border-green-500/50',
    rare: 'border-blue-500/50',
    epic: 'border-purple-500/50',
    legendary: 'border-yellow-500/50',
    mythic: 'border-red-500/50',
  };
  return borderMap[rarity.toLowerCase()] || 'border-gray-700';
};

const getRarityGlowStyle = (rarity: string | undefined): string => {
  if (!rarity) return '';
  const intensity = 1;
  const glowMap: Record<string, string> = {
    common: `box-shadow: 0 0 ${10 * intensity}px rgba(156, 163, 175, ${0.3 * intensity}), inset 0 0 ${5 * intensity}px rgba(156, 163, 175, 0.2);`,
    uncommon: `box-shadow: 0 0 ${15 * intensity}px rgba(34, 197, 94, ${0.5 * intensity}), inset 0 0 ${8 * intensity}px rgba(34, 197, 94, 0.3);`,
    rare: `box-shadow: 0 0 ${15 * intensity}px rgba(59, 130, 246, ${0.5 * intensity}), inset 0 0 ${8 * intensity}px rgba(59, 130, 246, 0.3);`,
    epic: `box-shadow: 0 0 ${20 * intensity}px rgba(168, 85, 247, ${0.6 * intensity}), inset 0 0 ${10 * intensity}px rgba(168, 85, 247, 0.4);`,
    legendary: `box-shadow: 0 0 ${25 * intensity}px rgba(234, 179, 8, ${0.7 * intensity}), inset 0 0 ${12 * intensity}px rgba(234, 179, 8, 0.5);`,
    mythic: `box-shadow: 0 0 ${30 * intensity}px rgba(239, 68, 68, ${0.8 * intensity}), inset 0 0 ${15 * intensity}px rgba(239, 68, 68, 0.6);`,
  };
  return glowMap[rarity.toLowerCase()] || '';
};

const getCurrencyName = (type: string) => {
  const names: Record<string, string> = {
    ling_stone: 'Linh Thạch',
    merit_point: 'Công Đức',
    essence: 'Tinh Hoa',
    immortal_jade: 'Tiên Ngọc',
  };
  return names[type] || type;
};
</script>

