<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-xl font-bold text-purple-400">Quản lý Vật Phẩm</h3>
      <button
        @click="showCreateModal = true"
        class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
      >
        + Tạo Vật Phẩm Mới
      </button>
    </div>

    <div v-if="items.length === 0" class="text-gray-400 text-center py-8">
      Chưa có item nào
    </div>
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
    >
      <div class="flex items-start justify-between gap-4">
        <!-- Số thứ tự -->
        <div class="flex-shrink-0 w-12 text-center">
          <div class="text-2xl font-bold text-gray-500">{{ getItemNumber(index) }}</div>
          <div class="text-xs text-gray-600">#{{ getItemNumber(index) }}</div>
        </div>
        
        <!-- Item Image -->
        <div
          class="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-gray-900/90 to-black/90 rounded-lg border-2 flex items-center justify-center relative overflow-hidden"
          :class="getRarityBorderClass(item.rarity)"
        >
          <img
            v-if="getItemImageUrl(item)"
            :src="getItemImageUrl(item)"
            :alt="item.name"
            class="w-full h-full object-contain p-2"
            @error="handleImageError"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-3xl"
            :class="getRarityColor(item.rarity)"
          >
            {{ getItemIcon(item) }}
          </div>
        </div>
        
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="font-bold text-white text-lg">{{ item.name }}</h3>
            <span
              class="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded"
            >
              {{ item.item_type }}
            </span>
            <span
              class="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded"
            >
              Grade {{ item.grade }}
            </span>
            <span
              class="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded"
            >
              {{ item.rarity }}
            </span>
          </div>
          <p class="text-sm text-gray-400 mb-2">{{ item.description }}</p>
          <div class="flex flex-wrap gap-2 text-xs">
            <span v-if="item.sell_price" class="text-gray-500">
              Giá: <span class="text-green-400">{{ item.sell_price }}</span>
            </span>
            <span v-if="item.max_stack > 1" class="text-gray-500">
              Stack: <span class="text-blue-400">{{ item.max_stack }}</span>
            </span>
            <span v-if="item.element && (Array.isArray(item.element) ? item.element.length > 0 : item.element !== 'none')" class="text-gray-500">
              Ngũ hành: 
              <span class="text-purple-400">
                {{ Array.isArray(item.element) ? item.element.map(e => getElementName(e)).join(', ') : getElementName(item.element) }}
              </span>
            </span>
            <span
              :class="item.is_active ? 'text-green-400' : 'text-red-400'"
            >
              {{ item.is_active ? 'Hoạt động' : 'Tạm dừng' }}
            </span>
          </div>
        </div>
        <div class="flex gap-2 ml-4">
          <button
            @click="handleEdit(item)"
            class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition-colors"
          >
            Sửa
          </button>
          <button
            @click="$emit('delete-item', item.id)"
            class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>

    <ItemFormModal
      :show="showCreateModal || editingItem !== null"
      :editing-item="editingItem"
      @close="handleCloseModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ItemFormModal from './ItemFormModal.vue';

const props = defineProps<{
  items: any[];
  currentPage?: number;
  pageSize?: number;
}>();

const emit = defineEmits<{
  'edit-item': [item: any];
  'delete-item': [itemId: number];
  'create-item': [data: any];
  'update-item': [id: number, data: any];
}>();

const showCreateModal = ref(false);
const editingItem = ref<any>(null);

const handleEdit = (item: any) => {
  editingItem.value = item;
};

const handleCloseModal = () => {
  showCreateModal.value = false;
  editingItem.value = null;
};

const handleSubmit = (data: any) => {
  if (editingItem.value) {
    emit('update-item', editingItem.value.id, data);
  } else {
    emit('create-item', data);
  }
  handleCloseModal();
};

const getItemImageUrl = (item: any): string | null => {
  if (!item?.icon_url) {
    return null;
  }

  // If it's already a full URL, return it
  if (
    item.icon_url.startsWith('http://') ||
    item.icon_url.startsWith('https://')
  ) {
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

const getItemIcon = (item: any): string => {
  if (!item) return '📦';
  const type = item.item_type?.toLowerCase() || '';
  if (type.includes('weapon') || type.includes('sword')) return '⚔️';
  if (type.includes('armor')) return '🛡️';
  if (type.includes('material')) return '💎';
  if (type.includes('consumable')) return '🧪';
  if (type === 'equipment') return '⚔️';
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
  if (!rarity) return 'border-gray-600';
  const borderMap: Record<string, string> = {
    common: 'border-gray-600',
    uncommon: 'border-green-500',
    rare: 'border-blue-500',
    epic: 'border-purple-500',
    legendary: 'border-yellow-500',
    mythic: 'border-red-500',
  };
  return borderMap[rarity.toLowerCase()] || 'border-gray-600';
};

const getElementName = (elem: string): string => {
  const names: Record<string, string> = {
    // Ngũ Hành
    kim: 'Kim',
    moc: 'Mộc',
    thuy: 'Thủy',
    hoa: 'Hỏa',
    tho: 'Thổ',
    // Dị Nguyên Tố
    loi: 'Lôi',
    bang: 'Băng',
    quang: 'Quang',
    am: 'Ám',
    phong: 'Phong',
    doc: 'Độc',
    thien: 'Thiên',
    dia: 'Địa',
  };
  return names[elem] || elem;
};

const getItemNumber = (index: number): number => {
  const page = props.currentPage || 1;
  const size = props.pageSize || 10;
  return (page - 1) * size + index + 1;
};
</script>

