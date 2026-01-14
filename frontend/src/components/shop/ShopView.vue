<template>
  <div class="w-full relative">
    <!-- Floating mist particles background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-32 h-32 bg-dao-qi-light/10 rounded-full blur-3xl animate-float"></div>
      <div class="absolute top-40 right-20 w-40 h-40 bg-dao-silver/10 rounded-full blur-3xl animate-float-delayed"></div>
      <div class="absolute bottom-20 left-1/4 w-36 h-36 bg-dao-qi/20 rounded-full blur-3xl animate-float-slow"></div>
    </div>

    <div class="relative z-10">
      <div class="mb-6 relative">
        <!-- Decorative cloud pattern -->
        <div class="absolute -top-4 left-0 w-24 h-8 bg-gradient-to-r from-dao-qi-light/20 to-transparent rounded-full blur-xl"></div>
        <h2 class="text-3xl font-bold mb-2 bg-gradient-to-r from-dao-gold via-yellow-300 to-dao-gold bg-clip-text text-transparent font-thu-phap drop-shadow-lg">
          仙 品 商 铺
        </h2>
        <div class="h-1 w-32 bg-gradient-to-r from-dao-gold via-dao-qi-light to-transparent rounded-full shadow-lg shadow-dao-gold/30"></div>
        <p class="text-dao-qi-light/80 text-sm mt-1 ml-1">Cửa Hàng Tiên Phẩm</p>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-dao-qi-light border-t-transparent mb-4 shadow-lg shadow-dao-qi-light/30"></div>
          <p class="text-dao-qi-light text-lg font-thu-phap">Đang tải cửa hàng...</p>
        </div>
      </div>

      <div v-else class="space-y-6">
        <ShopSelector
          :shops="shops"
          :selected-shop-id="selectedShopId"
          @shop-selected="handleShopSelected"
        />

        <div v-if="selectedShopId && shopItems.length > 0" class="grid grid-cols-4 gap-4 items-stretch">
          <ShopItemCard
            v-for="(shopItem, index) in shopItems"
            :key="shopItem.id"
            :shop-item="shopItem"
            :animation-delay="`${index * 50}ms`"
            @buy-item="handleBuyItem"
            @show-details="handleShowDetails"
          />
        </div>
        
        <div v-else-if="selectedShopId && shopItems.length === 0" class="text-center py-12 relative">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-64 h-64 bg-dao-qi-light/5 rounded-full blur-3xl"></div>
          </div>
          <p class="text-dao-qi-light/60 text-lg font-thu-phap relative z-10">Cửa hàng này hiện không có vật phẩm nào</p>
        </div>
      </div>

      <!-- Item Details Modal -->
      <div
        v-if="selectedItemDetails"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm modal-overlay"
        @click.self="closeDetails"
      >
        <div class="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-2xl border-2 border-dao-qi-light/40 shadow-2xl shadow-dao-qi-light/20 max-w-md w-full p-6 relative overflow-hidden">
          <!-- Decorative corners -->
          <div class="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-dao-qi-light/50 rounded-tl-xl"></div>
          <div class="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-dao-qi-light/50 rounded-tr-xl"></div>
          <div class="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-dao-qi-light/50 rounded-bl-xl"></div>
          <div class="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-dao-qi-light/50 rounded-br-xl"></div>
          
          <!-- Close button -->
          <button
            @click="closeDetails"
            class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-dao-qi/50 hover:bg-dao-qi-light/50 rounded-lg text-white transition-colors border border-dao-qi-light/30"
          >
            ✕
          </button>

          <!-- Item Image -->
          <div
            v-if="selectedItemDetails.item"
            class="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-gray-900/90 to-black/90 rounded-lg border-2 flex items-center justify-center relative overflow-hidden"
            :class="getRarityBorderClass(selectedItemDetails.item?.rarity)"
            :style="getRarityGlowStyle(selectedItemDetails.item?.rarity)"
          >
            <img
              v-if="getItemImageUrl(selectedItemDetails.item)"
              :src="getItemImageUrl(selectedItemDetails.item)"
              :alt="getDisplayName(selectedItemDetails.item?.name)"
              class="w-full h-full object-contain p-2"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-5xl"
              :class="getRarityColor(selectedItemDetails.item?.rarity)"
            >
              {{ getItemIcon(selectedItemDetails.item) }}
            </div>
          </div>

          <!-- Item Name (Full) -->
          <h2 class="text-xl font-bold text-white mb-3 text-center font-thu-phap">
            {{ getDisplayName(selectedItemDetails.item?.name) }}
          </h2>

          <!-- Item Description (Full) -->
          <p class="text-sm text-gray-300 mb-4 leading-relaxed text-center">
            {{ selectedItemDetails.item?.description }}
          </p>

          <!-- Price and Stock -->
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-dao-silver/20">
            <div class="flex flex-col">
              <span class="text-dao-gold font-bold text-lg">
                {{ formatNumber(selectedItemDetails.price) }}
              </span>
              <span class="text-xs text-dao-qi-light/70">{{ getCurrencyName(selectedItemDetails.currency_type) }}</span>
            </div>
            <span v-if="selectedItemDetails.stock !== null" class="text-sm text-dao-qi-light/60 bg-dao-qi/30 px-3 py-1 rounded border border-dao-qi-light/20">
              Còn: {{ formatNumber(selectedItemDetails.stock) }}
            </span>
          </div>

          <!-- Buy Button -->
          <button
            @click="handleBuyItem(selectedItemDetails.id, 1); closeDetails()"
            class="w-full bg-gradient-to-r from-dao-qi via-dao-qi-light/80 to-dao-qi hover:from-dao-qi-light hover:via-dao-qi-light hover:to-dao-qi text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-dao-qi-light/40 border border-dao-qi-light/30"
          >
            Mua Ngay
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../composables/useApi';
import ShopSelector from './ShopSelector.vue';
import ShopItemCard from './ShopItemCard.vue';

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

interface Shop {
  id: number;
  name: string;
  shop_type: string;
}

const props = defineProps<{
  characterId: number;
}>();

const shops = ref<Shop[]>([]);
const shopItems = ref<ShopItem[]>([]);
const selectedShopId = ref<number | null>(null);
const loading = ref(true);

const fetchShops = async () => {
  try {
    const response = await api.get('/shops');
    shops.value = response.data;
    if (shops.value.length > 0 && shops.value[0]) {
      selectedShopId.value = shops.value[0].id;
      await fetchShopItems();
    }
  } catch (error) {
    console.error('Error fetching shops:', error);
  } finally {
    loading.value = false;
  }
};

const fetchShopItems = async () => {
  if (!selectedShopId.value) return;
  try {
    const response = await api.get(`/shops/${selectedShopId.value}/items`);
    shopItems.value = response.data;
  } catch (error) {
    console.error('Error fetching shop items:', error);
  }
};

const handleShopSelected = async (shopId: number) => {
  selectedShopId.value = shopId;
  await fetchShopItems();
};

const handleBuyItem = async (shopItemId: number, quantity: number = 1) => {
  try {
    const response = await api.post('/shops/buy', {
      characterId: props.characterId,
      shopItemId,
      quantity,
    });
    if (response.data.success) {
      alert(`Mua thành công ${quantity} vật phẩm!`);
      await fetchShopItems();
    } else {
      alert(response.data.message || 'Mua thất bại');
    }
  } catch (error) {
    console.error('Error buying item:', error);
    alert('Có lỗi xảy ra');
  }
};

const selectedItemDetails = ref<ShopItem | null>(null);

const handleShowDetails = (shopItem: ShopItem) => {
  selectedItemDetails.value = shopItem;
};

const closeDetails = () => {
  selectedItemDetails.value = null;
};

onMounted(() => {
  fetchShops();
});

// Helper functions for modal
const getItemImageUrl = (item: Item | undefined): string | undefined => {
  if (!item?.icon_url) {
    return undefined;
  }

  // If it's already a full URL, return it
  if (item.icon_url.startsWith('http://') || item.icon_url.startsWith('https://')) {
    return item.icon_url;
  }

  // If it's a relative path, construct full URL
  const apiBaseUrl = 'http://localhost:3000';
  return `${apiBaseUrl}/public/items/${item.icon_url}`;
};

const getDisplayName = (name: string | undefined): string => {
  if (!name) return '';
  return name.replace(/\s*\[(Đỏ|Vàng|Tím|Lam|Lục|Trắng|Xám)\]\s*$/i, '').trim();
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

const formatNumber = (num: number) => {
  return num.toLocaleString('vi-VN');
};
</script>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) translateX(10px);
    opacity: 0.6;
  }
}

@keyframes float-delayed {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
    opacity: 0.2;
  }
  50% {
    transform: translateY(-15px) translateX(-15px);
    opacity: 0.5;
  }
}

@keyframes float-slow {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
    opacity: 0.25;
  }
  50% {
    transform: translateY(-25px) translateX(5px);
    opacity: 0.55;
  }
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 10s ease-in-out infinite;
  animation-delay: 2s;
}

.animate-float-slow {
  animation: float-slow 12s ease-in-out infinite;
  animation-delay: 4s;
}

/* Modal animation */
.modal-overlay {
  animation: fadeIn 0.3s ease;
}

.modal-overlay > div {
  animation: slideUp 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: scale(0.9) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>

