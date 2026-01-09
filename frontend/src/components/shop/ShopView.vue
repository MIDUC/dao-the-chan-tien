<template>
  <div class="w-full">
    <h2 class="text-xl font-bold mb-4 text-dao-gold">Cửa Hàng</h2>

    <div v-if="loading" class="text-gray-400 animate-pulse">Đang tải...</div>

    <div v-else class="space-y-4">
      <ShopSelector
        :shops="shops"
        :selected-shop-id="selectedShopId"
        @shop-selected="handleShopSelected"
      />

      <div v-if="selectedShopId" class="grid grid-cols-2 gap-3">
        <ShopItemCard
          v-for="shopItem in shopItems"
          :key="shopItem.id"
          :shop-item="shopItem"
          @buy-item="handleBuyItem"
        />
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
    if (shops.value.length > 0) {
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

onMounted(() => {
  fetchShops();
});
</script>

