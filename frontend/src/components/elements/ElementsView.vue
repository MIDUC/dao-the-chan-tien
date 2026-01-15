<template>
  <div class="elements-view w-full p-4">
    <h2 class="text-xl font-bold text-gray-200 mb-4">Tu Luyện - Linh Căn</h2>

    <!-- Loading State -->
    <div v-if="loading" class="text-center text-gray-400 py-8">
      Đang tải linh căn...
    </div>

    <!-- Debug: Show if items are being fetched -->
    <div v-if="!loading" class="text-xs text-gray-500 mb-2 p-2 bg-gray-800 rounded">
      <div>Debug Info:</div>
      <div>characterId: {{ props.characterId }}</div>
      <div>Total items in inventory: {{ elementItems.length }}</div>
      <div>Selected element: {{ selectedElement?.type || 'none' }}</div>
      <div>Filtered items: {{ selectedElement ? getItemsForElement(selectedElement.type).length : 0 }}</div>
    </div>

    <!-- Elements Grid -->
    <div v-else class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
      <div
        v-for="element in allElements"
        :key="element.type"
        class="element-card rounded-lg border-2 p-4 cursor-pointer transition-all"
        :class="{
          'border-yellow-500': selectedElement?.type === element.type,
        }"
        :style="getElementBorderStyle(element.grade)"
        @click="selectElement(element)"
      >
        <div class="text-center">
          <div class="text-2xl mb-2">{{ getElementIcon(element.type) }}</div>
          <div class="text-sm font-semibold text-gray-200 mb-1">
            {{ getElementName(element.type) }}
          </div>
          <div
            class="text-xs px-2 py-1 rounded inline-block mb-2"
            :style="getGradeBadgeStyle(element.grade)"
          >
            {{ getGradeName(element.grade) }}
          </div>
          <div class="text-xs text-gray-400">
            Cấp {{ element.level || 0 }}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            EXP: {{ Math.floor(element.exp || 0) }} / {{ getExpNeeded(element.level || 1) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Element Details & Upgrade Panel -->
    <div
      v-if="selectedElement"
      class="element-details bg-gray-800/50 rounded-lg border p-4"
      :style="getElementBorderStyle(selectedElement.grade, true)"
    >
      <div class="flex items-start justify-between mb-3">
        <div>
          <h3 class="text-lg font-bold text-gray-200 mb-1 flex items-center gap-2">
            <span class="text-2xl">{{ getElementIcon(selectedElement.type) }}</span>
            {{ getElementName(selectedElement.type) }}
          </h3>
          <div
            class="text-xs px-2 py-1 rounded inline-block"
            :style="getGradeBadgeStyle(selectedElement.grade)"
          >
            {{ getGradeName(selectedElement.grade) }} - Cấp {{ selectedElement.level }}
          </div>
        </div>
        <button
          @click="selectedElement = null"
          class="text-gray-400 hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="mb-4">
        <div class="flex justify-between text-xs text-gray-400 mb-1">
          <span>Tiến độ</span>
          <span>
            {{ Math.floor(selectedElement.exp || 0) }} /
            {{ getExpNeeded(selectedElement.level) }}
          </span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2">
          <div
            class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
            :style="`width: ${getProgressPercentage(selectedElement)}%`"
          ></div>
        </div>
      </div>

      <!-- Element Items from Inventory -->
      <div>
        <h4 class="text-sm font-semibold text-gray-200 mb-2">Đá Ngũ Hành (Từ Túi Đồ)</h4>
        
        <!-- Debug Info -->
        <div class="text-xs text-gray-500 mb-2">
          Debug: Total items: {{ elementItems.length }}, 
          Selected element: {{ selectedElement.type }}, 
          Filtered: {{ getItemsForElement(selectedElement.type).length }}
        </div>
        
        <div v-if="getItemsForElement(selectedElement.type).length > 0" class="grid grid-cols-3 gap-2">
          <button
            v-for="invItem in getItemsForElement(selectedElement.type)"
            :key="invItem.id"
            @click="useItem(selectedElement, invItem)"
            :disabled="usingItem || invItem.quantity <= 0"
            class="item-button p-2 rounded border border-gray-600 hover:border-yellow-500 transition-colors disabled:opacity-50 bg-gray-700"
          >
            <div class="text-xs text-gray-200 mb-1">{{ invItem.item.name }}</div>
            <div class="text-xs text-gray-400">
              Số lượng: {{ invItem.quantity }}
            </div>
            <div class="text-xs text-gray-500">
              +{{ getExpFromRarity(invItem.item.rarity) }} EXP
            </div>
          </button>
        </div>
        <div v-else class="text-xs text-gray-500">
          Không có đá ngũ hành {{ getElementName(selectedElement.type) }} trong túi đồ
          <div class="text-xs text-gray-600 mt-1">
            (Tìm thấy {{ elementItems.length }} items trong inventory, element type: {{ selectedElement.type }})
          </div>
          <div v-if="elementItems.length > 0" class="text-xs text-gray-400 mt-2">
            Items có sẵn:
            <div v-for="invItem in elementItems" :key="invItem.id" class="ml-2">
              - {{ invItem.item.name }}: element = {{ JSON.stringify(invItem.item.element) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { api } from '../../composables/useApi';

interface Element {
  id?: number;
  type: string;
  grade: string;
  level: number;
  exp: number;
}

interface InventoryItem {
  id: number;
  item_id: number;
  quantity: number;
  item: {
    id: number;
    name: string;
    element?: string[];
    rarity: string;
    icon_url?: string;
  };
}

const props = defineProps<{
  characterId: number;
}>();

const elements = ref<Element[]>([]);
const elementItems = ref<InventoryItem[]>([]);
const selectedElement = ref<Element | null>(null);
const loading = ref(false);
const usingItem = ref(false);

// All possible element types
const allElementTypes = [
  'kim', 'moc', 'thuy', 'hoa', 'tho', 'loi', 'bang', 'duong', 'am'
];

// Get all elements (including missing ones)
const allElements = computed(() => {
  return allElementTypes.map(type => {
    const existing = elements.value.find(e => e.type === type);
    return existing || {
      type,
      grade: 'pham',
      level: 0,
      exp: 0,
    };
  });
});

const getElementName = (type: string): string => {
  const names: Record<string, string> = {
    kim: 'Kim',
    moc: 'Mộc',
    thuy: 'Thủy',
    hoa: 'Hỏa',
    tho: 'Thổ',
    loi: 'Lôi',
    bang: 'Băng',
    duong: 'Dương',
    am: 'Âm',
  };
  return names[type] || type;
};

const getElementIcon = (type: string): string => {
  const icons: Record<string, string> = {
    kim: '⚔️',
    moc: '🌳',
    thuy: '💧',
    hoa: '🔥',
    tho: '⛰️',
    loi: '⚡',
    bang: '❄️',
    duong: '☀️',
    am: '🌙',
  };
  return icons[type] || '✨';
};

const getElementBorderStyle = (grade: string, isDetail: boolean = false) => {
  const styles: Record<string, string> = {
    pham: isDetail ? 'border-gray-500 bg-gray-800/30' : 'border-gray-500 bg-gray-800/20',
    tot: isDetail ? 'border-green-500 bg-green-900/20' : 'border-green-500 bg-green-900/10',
    hiem: isDetail ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-900/10',
    cuc_hiem: isDetail ? 'border-purple-500 bg-purple-900/20' : 'border-purple-500 bg-purple-900/10',
    huyen_thoai: isDetail ? 'border-yellow-500 bg-yellow-900/20' : 'border-yellow-500 bg-yellow-900/10',
    than_thoai: isDetail ? 'border-red-500 bg-red-900/20' : 'border-red-500 bg-red-900/10',
  };
  return {
    border: '2px solid',
    borderColor: styles[grade]?.split(' ')[0]?.replace('border-', '') || 'gray',
    backgroundColor: styles[grade]?.split(' ')[1] || 'transparent',
  };
};

const getGradeBadgeStyle = (grade: string) => {
  const styles: Record<string, string> = {
    pham: 'background-color: #6b7280; color: white;',
    tot: 'background-color: #10b981; color: white;',
    hiem: 'background-color: #3b82f6; color: white;',
    cuc_hiem: 'background-color: #a855f7; color: white;',
    huyen_thoai: 'background-color: #eab308; color: black;',
    than_thoai: 'background-color: #ef4444; color: white;',
  };
  return styles[grade] || styles.pham;
};

const getGradeName = (grade: string): string => {
  const names: Record<string, string> = {
    pham: 'Phàm',
    tot: 'Tốt',
    hiem: 'Hiếm',
    cuc_hiem: 'Cực Hiếm',
    huyen_thoai: 'Huyền Thoại',
    than_thoai: 'Thần Thoại',
  };
  return names[grade] || grade;
};

const getExpNeeded = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

const getProgressPercentage = (element: Element): number => {
  if (!element.level) return 0;
  const needed = getExpNeeded(element.level);
  if (needed === 0) return 0;
  return Math.min((element.exp / needed) * 100, 100);
};

const selectElement = async (element: Element) => {
  selectedElement.value = element;
  // Refresh items when selecting element
  await fetchElementItems();
};

const getItemsForElement = (elementType: string): InventoryItem[] => {
  console.log('getItemsForElement - elementType:', elementType);
  console.log('getItemsForElement - elementItems:', elementItems.value);
  
  const filtered = elementItems.value.filter(invItem => {
    const item = invItem.item;
    console.log('Checking item:', item.name, 'element:', item.element, 'category:', item.category);
    
    // Check if item has element array - direct match
    if (item.element && Array.isArray(item.element)) {
      const matches = item.element.includes(elementType);
      console.log('Item element array check:', item.element, 'includes', elementType, '=', matches);
      if (matches) {
        console.log('✅ Item matches:', item.name);
        return true;
      }
    }
    
    // Fallback: Try to parse from category or name
    const category = item.category || '';
    const name = item.name || '';
    const lowerCategory = category.toLowerCase();
    const lowerName = name.toLowerCase();
    
    // Check if category or name contains element type
    if (lowerCategory.includes(elementType) || lowerName.includes(elementType)) {
      console.log('✅ Item matches by name/category:', item.name);
      return true;
    }
    
    console.log('❌ Item does not match:', item.name);
    return false;
  });
  
  console.log('Filtered items for', elementType, ':', filtered.length, 'items');
  return filtered;
};

const getExpFromRarity = (rarity: string): number => {
  const expMap: Record<string, number> = {
    common: 100,
    uncommon: 500,
    rare: 1000,
    epic: 2000,
    legendary: 5000,
    mythic: 10000,
  };
  return expMap[rarity] || 100;
};

const useItem = async (element: Element, invItem: InventoryItem) => {
  if (usingItem.value || invItem.quantity <= 0) return;
  usingItem.value = true;
  try {
    const response = await api.post(`/elements/character/${props.characterId}/use-item`, {
      elementType: element.type,
      inventoryId: invItem.id,
    });
    // Refresh elements and items
    await fetchCharacterElements();
    await fetchElementItems();
    if (response.data.element) {
      selectedElement.value = response.data.element;
    }
  } catch (error: any) {
    console.error('Error using item:', error);
    alert(error.response?.data?.message || 'Không thể sử dụng đá');
  } finally {
    usingItem.value = false;
  }
};

const fetchCharacterElements = async () => {
  if (!props.characterId) return;
  loading.value = true;
  try {
    const response = await api.get(`/elements/character/${props.characterId}`);
    elements.value = response.data || [];
  } catch (error) {
    console.error('Error fetching elements:', error);
    elements.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchElementItems = async () => {
  if (!props.characterId) {
    console.warn('⚠️ fetchElementItems: No characterId');
    return;
  }
  try {
    console.log('🔍 Fetching element items for character:', props.characterId);
    const response = await api.get(`/elements/character/${props.characterId}/items`);
    console.log('📦 Element items API response (full):', response);
    console.log('📦 Element items response type:', typeof response);
    
    // Axios returns full response object, data is in response.data
    const data = response.data;
    console.log('📦 Element items response.data:', data);
    console.log('📦 Element items response.data type:', typeof data);
    console.log('📦 Element items response.data isArray:', Array.isArray(data));
    
    // Handle response format
    let items = data;
    if (!Array.isArray(items)) {
      // If wrapped in another object
      items = items?.data || items || [];
    }
    
    console.log('📦 Processed items:', items);
    console.log('📦 Items isArray:', Array.isArray(items));
    elementItems.value = Array.isArray(items) ? items : [];
    
    console.log('✅ elementItems.value set to:', elementItems.value);
    console.log('✅ Total items:', elementItems.value.length);
    
    // Log each item
    if (elementItems.value.length > 0) {
      elementItems.value.forEach((invItem: any, index: number) => {
        console.log(`  📦 Item ${index + 1}:`, {
          id: invItem.id,
          name: invItem.item?.name,
          element: invItem.item?.element,
          quantity: invItem.quantity,
          fullItem: invItem,
        });
      });
    } else {
      console.warn('⚠️ No items found in inventory');
      console.warn('⚠️ This might be an API issue. Check backend logs.');
    }
  } catch (error: any) {
    console.error('❌ Error fetching element items:', error);
    console.error('❌ Error response:', error.response);
    console.error('❌ Error response data:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error statusText:', error.response?.statusText);
    console.error('❌ Error message:', error.message);
    console.error('❌ Full error:', JSON.stringify(error, null, 2));
    elementItems.value = [];
    
    // Show user-friendly error
    if (error.response?.status === 401) {
      console.error('❌ Authentication error - token might be invalid');
    } else if (error.response?.status === 403) {
      console.error('❌ Forbidden - character does not belong to user');
    } else if (error.response?.status === 404) {
      console.error('❌ Not found - API endpoint might be wrong');
    }
  }
};

watch(
  () => props.characterId,
  (newId) => {
    if (newId) {
      fetchCharacterElements();
      fetchElementItems();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.characterId) {
    fetchCharacterElements();
    fetchElementItems();
  }
});

watch(
  () => props.characterId,
  (newId) => {
    if (newId) {
      fetchElementItems();
    }
  }
);
</script>

<style scoped>
.element-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.stone-button:hover:not(:disabled) {
  background-color: rgba(234, 179, 8, 0.1);
}
</style>

