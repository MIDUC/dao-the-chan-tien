<template>
  <div class="flex gap-3 mb-6 p-1.5 bg-gradient-to-r from-gray-900/60 via-gray-800/50 to-gray-900/60 rounded-xl border border-dao-silver/20 backdrop-blur-sm relative overflow-hidden">
    <!-- Decorative cloud pattern -->
    <div class="absolute inset-0 bg-gradient-to-r from-dao-qi-light/5 via-transparent to-dao-qi-light/5 opacity-50"></div>
    
    <button
      v-for="shop in shops"
      :key="shop.id"
      @click="$emit('shop-selected', shop.id)"
      class="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 relative overflow-hidden group z-10"
      :class="selectedShopId === shop.id 
        ? 'bg-gradient-to-r from-dao-qi via-dao-qi-light/60 to-dao-qi text-white shadow-lg shadow-dao-qi-light/30 scale-105 border border-dao-qi-light/40' 
        : 'bg-transparent text-dao-qi-light/60 hover:text-dao-qi-light hover:bg-dao-qi/20 border border-transparent hover:border-dao-qi-light/20'"
    >
      <span class="relative z-10 font-thu-phap">{{ shop.name }}</span>
      <div 
        v-if="selectedShopId === shop.id"
        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
      ></div>
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

