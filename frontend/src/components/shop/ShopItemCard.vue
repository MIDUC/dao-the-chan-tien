<template>
  <div
    @click="$emit('show-details', shopItem)"
    class="group bg-gradient-to-br from-gray-800/90 via-gray-800/80 to-gray-900/90 p-3 rounded-xl border border-dao-silver/20 transition-all duration-300 relative overflow-hidden hover:border-dao-qi-light/60 hover:shadow-xl hover:shadow-dao-qi-light/30 hover:-translate-y-1 animate-fade-in flex flex-col h-full backdrop-blur-sm cursor-pointer"
    :style="
      props.animationDelay ? { animationDelay: props.animationDelay } : {}
    "
  >
    <!-- Floating mist effect -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-dao-qi-light/0 via-dao-silver/0 to-dao-qi/0 group-hover:from-dao-qi-light/10 group-hover:via-dao-silver/5 group-hover:to-dao-qi/10 transition-all duration-500 opacity-0 group-hover:opacity-100 rounded-xl"
    ></div>

    <!-- Decorative corner elements (tu tiên style) -->
    <div
      class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-dao-qi-light/30 rounded-tl-xl"
    ></div>
    <div
      class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-dao-qi-light/30 rounded-tr-xl"
    ></div>
    <div
      class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-dao-qi-light/30 rounded-bl-xl"
    ></div>
    <div
      class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-dao-qi-light/30 rounded-br-xl"
    ></div>

    <!-- Item Image with rarity frame -->
    <div
      @click.stop
      class="w-full aspect-square mb-3 bg-gradient-to-br from-gray-900/90 via-gray-950/80 to-black/90 rounded-lg border-2 flex items-center justify-center relative overflow-hidden group/image flex-shrink-0"
      :class="getRarityBorderClass(shopItem.item?.rarity)"
      :style="getRarityGlowStyle(shopItem.item?.rarity)"
    >
      <!-- Cloud pattern overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-dao-qi-light/5 via-transparent to-dao-silver/5 rounded-lg opacity-50"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30 rounded-lg"
      ></div>

      <img
        v-if="getItemImageUrl(shopItem.item)"
        :src="getItemImageUrl(shopItem.item) || ''"
        :alt="getDisplayName(shopItem.item?.name)"
        class="w-full h-full object-contain p-1.5 relative z-10 transition-transform duration-300 group-hover/image:scale-110"
        @error="handleImageError"
      />
      <!-- Fallback icon if image fails to load -->
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-3xl relative z-10 transition-transform duration-300 group-hover/image:scale-110"
        :class="getRarityColor(shopItem.item?.rarity)"
      >
        {{ getItemIcon(shopItem.item) }}
      </div>
    </div>

    <!-- Content wrapper with fixed heights -->
    <div class="flex flex-col flex-1 min-h-0" @click.stop>
      <!-- Item Name (without suffix) - Fixed height -->
      <h3
        class="font-bold text-white mb-1.5 text-xs leading-tight group-hover:text-dao-qi-light transition-colors h-8 flex items-center"
      >
        <span class="line-clamp-2">{{
          getDisplayName(shopItem.item?.name)
        }}</span>
      </h3>

      <!-- Description - Fixed height -->
      <p
        class="text-xs text-gray-400 mb-3 line-clamp-2 leading-tight h-10 flex items-start"
      >
        {{ shopItem.item?.description }}
      </p>

      <!-- Price and Stock - Fixed height -->
      <div
        class="flex items-center justify-between mb-3 pb-2 border-b border-dao-silver/20 h-10"
      >
        <div class="flex flex-col justify-center">
          <span
            class="text-dao-gold font-bold text-xs drop-shadow-lg leading-tight"
            :title="shopItem.price.toLocaleString('vi-VN')"
          >
            {{ formatNumber(shopItem.price) }}
          </span>
          <span class="text-[10px] text-dao-qi-light/70 leading-tight">{{
            getCurrencyName(shopItem.currency_type)
          }}</span>
        </div>
        <span
          v-if="shopItem.stock !== null"
          class="text-[10px] text-dao-qi-light/60 bg-dao-qi/30 px-2 py-0.5 rounded border border-dao-qi-light/20 whitespace-nowrap"
        >
          Còn: {{ formatNumber(shopItem.stock) }}
        </span>
      </div>

      <!-- Quantity selector for stackable items (materials) - Fixed height or hidden -->
      <div
        v-if="isStackable(shopItem.item)"
        class="mb-3 flex flex-col gap-1.5 h-12"
      >
        <div class="flex items-center gap-1 justify-center">
          <button
            @click="decreaseQuantity"
            :disabled="quantity <= 1"
            class="w-6 h-6 bg-gradient-to-br from-dao-qi/50 to-dao-qi/30 hover:from-dao-qi-light/50 hover:to-dao-qi-light/30 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-md text-xs font-bold transition-all shadow-sm hover:shadow border border-dao-qi-light/20"
          >
            −
          </button>
          <input
            v-model.number="quantity"
            type="number"
            min="1"
            :max="getMaxQuantity"
            class="w-12 h-6 bg-gray-800/80 border border-dao-qi-light/30 text-white text-center text-xs rounded-md focus:outline-none focus:border-dao-qi-light focus:ring-1 focus:ring-dao-qi-light"
          />
          <button
            @click="increaseQuantity"
            :disabled="quantity >= getMaxQuantity"
            class="w-6 h-6 bg-gradient-to-br from-dao-qi/50 to-dao-qi/30 hover:from-dao-qi-light/50 hover:to-dao-qi-light/30 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-md text-xs font-bold transition-all shadow-sm hover:shadow border border-dao-qi-light/20"
          >
            +
          </button>
        </div>
        <span class="text-[10px] text-dao-qi-light/60 text-center">
          Tổng:
          <span class="text-dao-gold font-semibold">{{
            formatNumber(shopItem.price * quantity)
          }}</span>
        </span>
      </div>

      <!-- Spacer for non-stackable items to maintain alignment -->
      <div v-else class="mb-3 h-12"></div>
    </div>

    <!-- Buy Button -->
    <button
      @click="$emit('buy-item', shopItem.id, quantity)"
      class="w-full bg-gradient-to-r from-dao-qi via-dao-qi-light/80 to-dao-qi hover:from-dao-qi-light hover:via-dao-qi-light hover:to-dao-qi text-white py-2 rounded-lg text-xs font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-dao-qi-light/40 relative overflow-hidden group/button mt-auto flex-shrink-0 border border-dao-qi-light/30"
    >
      <span class="relative z-10"
        >Mua{{ isStackable(shopItem.item) ? ` (${quantity})` : "" }}</span
      >
      <div
        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/button:translate-x-full transition-transform duration-700"
      ></div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { formatNumber } from "../../utils/formatNumber";

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
  animationDelay?: string;
}>();

defineEmits<{
  "buy-item": [shopItemId: number, quantity: number];
  "show-details": [shopItem: ShopItem];
}>();

const quantity = ref(1);

// Check if item is stackable (materials, consumables, but not equipment)
const isStackable = (item: Item | undefined): boolean => {
  if (!item?.item_type) return false;
  const type = item.item_type.toLowerCase();
  // Equipment cannot stack, everything else can
  return type !== "equipment";
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
  if (!name) return "";
  // Remove patterns like [Đỏ], [Vàng], [Tím], [Lam], [Lục], [Trắng]
  return name.replace(/\s*\[(Đỏ|Vàng|Tím|Lam|Lục|Trắng|Xám)\]\s*$/i, "").trim();
};

const getItemImageUrl = (item: Item | undefined): string | undefined => {
  if (!item?.icon_url) {
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
  const apiBaseUrl = "http://localhost:3000";
  return `${apiBaseUrl}/public/items/${item.icon_url}`;
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = "none";
};

const getItemIcon = (item: Item | undefined): string => {
  if (!item) return "📦";
  const type = item.item_type?.toLowerCase() || "";
  if (type.includes("weapon") || type.includes("sword")) return "⚔️";
  if (type.includes("armor")) return "🛡️";
  if (type.includes("material")) return "💎";
  if (type.includes("consumable")) return "🧪";
  return "📦";
};

const getRarityColor = (rarity: string | undefined): string => {
  if (!rarity) return "text-gray-400";
  const colorMap: Record<string, string> = {
    common: "text-gray-400",
    uncommon: "text-green-400",
    rare: "text-blue-400",
    epic: "text-purple-400",
    legendary: "text-yellow-400",
    mythic: "text-red-400",
  };
  return colorMap[rarity.toLowerCase()] || "text-gray-400";
};

const getRarityBorderClass = (rarity: string | undefined): string => {
  if (!rarity) return "border-gray-700";
  const borderMap: Record<string, string> = {
    common: "border-gray-600",
    uncommon: "border-green-500/50",
    rare: "border-blue-500/50",
    epic: "border-purple-500/50",
    legendary: "border-yellow-500/50",
    mythic: "border-red-500/50",
  };
  return borderMap[rarity.toLowerCase()] || "border-gray-700";
};

const getRarityGlowStyle = (rarity: string | undefined): string => {
  if (!rarity) return "";
  const intensity = 1;
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
  return glowMap[rarity.toLowerCase()] || "";
};

const getCurrencyName = (type: string) => {
  const names: Record<string, string> = {
    ling_stone: "Linh Thạch",
    merit_point: "Công Đức",
    essence: "Tinh Hoa",
    immortal_jade: "Tiên Ngọc",
  };
  return names[type] || type;
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
  opacity: 0;
}
</style>
