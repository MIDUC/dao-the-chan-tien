<template>
  <div class="flex gap-2 mb-4">
    <button
      v-for="shop in shops"
      :key="shop.id"
      @click="$emit('shop-selected', shop.id)"
      class="px-4 py-2 rounded-lg"
      :class="selectedShopId === shop.id ? 'bg-dao-qi text-white' : 'bg-gray-800 text-gray-300'"
    >
      {{ shop.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Shop {
  id: number;
  name: string;
  shop_type: string;
}

defineProps<{
  shops: Shop[];
  selectedShopId: number | null;
}>();

defineEmits<{
  'shop-selected': [shopId: number];
}>();
</script>

