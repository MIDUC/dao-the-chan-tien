<template>
  <div class="character-info-tab p-2 space-y-2">
    <div v-if="loading" class="text-center text-gray-400 py-4">
      Đang tải thông tin...
    </div>

    <div v-else-if="stats" class="space-y-2">
      <!-- Basic Info -->
      <div class="bg-gray-800/50 rounded p-2 border border-gray-700/50">
        <h3 class="text-sm font-bold text-purple-400 mb-2">Thông Tin Cơ Bản</h3>
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Tên Nhân Vật</div>
            <div class="text-xs font-bold text-purple-400">{{ stats.display_name }}</div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">EXP/Interval</div>
            <div class="text-xs font-bold text-blue-400">{{ formatNumber(stats.base_exp_per_interval) }}</div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Túi Đồ</div>
            <div class="text-xs font-bold text-green-400">{{ stats.max_inventory_slots }} ô</div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Đăng Nhập Cuối</div>
            <div class="text-xs font-bold text-gray-300">{{ formatDate(stats.last_login_at) }}</div>
          </div>
        </div>
      </div>

      <!-- Primary Stats (Tầng Gốc) -->
      <div class="bg-gray-800/50 rounded p-2 border border-gray-700/50">
        <h3 class="text-sm font-bold text-purple-400 mb-2">Tầng Gốc</h3>
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Lực Đạo</div>
            <div class="text-xs font-bold text-red-400">{{ stats.primary.luc_dao }}</div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Căn Cốt</div>
            <div class="text-xs font-bold text-green-400">{{ stats.primary.can_cot }}</div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Thân Pháp</div>
            <div class="text-xs font-bold text-blue-400">{{ stats.primary.than_phap }}</div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Ngộ Tính</div>
            <div class="text-xs font-bold text-yellow-400">{{ stats.primary.ngo_tinh }}</div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5 col-span-2">
            <div class="text-[10px] text-gray-400">Định Lực</div>
            <div class="text-xs font-bold text-purple-400">{{ stats.primary.dinh_luc }}</div>
          </div>
        </div>
      </div>

      <!-- Hidden Stats (Tầng Tiên Thiên) -->
      <div class="bg-gray-800/50 rounded p-2 border border-gray-700/50">
        <h3 class="text-sm font-bold text-purple-400 mb-2">Tầng Tiên Thiên</h3>
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Linh Căn</div>
            <div class="text-xs font-bold text-cyan-400">{{ formatElement(stats.hidden.linh_can) }}</div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Phúc Duyên</div>
            <div class="text-xs font-bold text-yellow-400">{{ stats.hidden.phuc_duyen }}</div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5 col-span-2">
            <div class="text-[10px] text-gray-400">Tâm Cảnh</div>
            <div class="text-xs font-bold text-pink-400">{{ stats.hidden.tam_canh }}</div>
          </div>
        </div>
      </div>

      <!-- Combat Stats (Tầng Thực Chiến) -->
      <div class="bg-gray-800/50 rounded p-2 border border-gray-700/50">
        <h3 class="text-sm font-bold text-purple-400 mb-2">Tầng Thực Chiến</h3>
        
        <!-- HP & MP -->
        <div class="grid grid-cols-2 gap-2 mb-2">
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Sinh Lực</div>
            <div class="text-xs font-bold text-red-400">
              {{ formatNumber(stats.combat.hp) }} / {{ formatNumber(stats.combat.max_hp) }}
            </div>
            <div class="w-full bg-gray-600 rounded-full h-1 mt-1">
              <div
                class="bg-red-500 h-1 rounded-full transition-all"
                :style="{ width: (stats.combat.hp / stats.combat.max_hp) * 100 + '%' }"
              ></div>
            </div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Linh Lực</div>
            <div class="text-xs font-bold text-blue-400">
              {{ formatNumber(stats.combat.mp) }} / {{ formatNumber(stats.combat.max_mp) }}
            </div>
            <div class="w-full bg-gray-600 rounded-full h-1 mt-1">
              <div
                class="bg-blue-500 h-1 rounded-full transition-all"
                :style="{ width: (stats.combat.mp / stats.combat.max_mp) * 100 + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Attack Stats -->
        <div class="grid grid-cols-2 gap-2 mb-2">
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Vật Công</div>
            <div class="text-xs font-bold text-orange-400">{{ formatNumber(stats.combat.physical_attack) }}</div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Pháp Công</div>
            <div class="text-xs font-bold text-purple-400">{{ formatNumber(stats.combat.magical_attack) }}</div>
          </div>
        </div>

        <!-- Defense Stats -->
        <div class="grid grid-cols-2 gap-2 mb-2">
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Vật Phòng</div>
            <div class="text-xs font-bold text-green-400">{{ formatNumber(stats.combat.physical_defense) }}</div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Pháp Phòng</div>
            <div class="text-xs font-bold text-cyan-400">{{ formatNumber(stats.combat.magical_defense) }}</div>
          </div>
        </div>

        <!-- Combat Modifiers -->
        <div class="grid grid-cols-2 gap-2 mb-2">
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Bạo Kích</div>
            <div class="text-xs font-bold text-red-400">{{ stats.combat.critical_chance.toFixed(1) }}%</div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Sát Thương BK</div>
            <div class="text-xs font-bold text-red-500">{{ (stats.combat.critical_damage * 100).toFixed(0) }}%</div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Tốc Độ</div>
            <div class="text-xs font-bold text-yellow-400">{{ formatNumber(stats.combat.speed) }}</div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Né Tránh</div>
            <div class="text-xs font-bold text-green-400">{{ stats.combat.dodge.toFixed(1) }}%</div>
          </div>
        </div>
        
        <!-- Additional Combat Stats -->
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Tốc Độ Đánh</div>
            <div class="text-xs font-bold text-orange-400">{{ stats.combat.attack_speed.toFixed(2) }}/s</div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Sức Mang Vác</div>
            <div class="text-xs font-bold text-cyan-400">{{ formatNumber(stats.combat.carry_capacity) }}</div>
          </div>
        </div>
      </div>

      <!-- Realm Info -->
      <div class="bg-gray-800/50 rounded p-2 border border-gray-700/50">
        <h3 class="text-sm font-bold text-purple-400 mb-2">Cảnh Giới</h3>
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Cấp Độ</div>
            <div class="text-xs font-bold text-purple-400">{{ stats.realm_level }}</div>
          </div>
          <div class="bg-gray-700/30 rounded p-1.5">
            <div class="text-[10px] text-gray-400">Linh Khí</div>
            <div class="text-xs font-bold text-blue-400">{{ formatNumber(stats.exp) }}</div>
          </div>
        </div>
      </div>

      <!-- Elements (Nguyên Tố) -->
      <div class="bg-gray-800/50 rounded p-2 border border-gray-700/50">
        <h3 class="text-sm font-bold text-purple-400 mb-2">
          Nguyên Tố ({{ stats.elements?.length || 0 }})
        </h3>
        <div v-if="!stats.elements || stats.elements.length === 0" class="text-xs text-gray-500 text-center py-2">
          Chưa có nguyên tố
        </div>
        <div v-else class="grid grid-cols-3 gap-2">
          <div
            v-for="element in stats.elements"
            :key="element.type"
            class="bg-gray-700/30 rounded p-1.5"
          >
            <div class="text-[10px] text-gray-400">{{ formatElement(element.type) }}</div>
            <div class="text-xs font-bold" :class="getElementColor(element.type)">
              Lv.{{ element.level }} ({{ formatElementGrade(element.grade) }})
            </div>
            <div class="text-[9px] text-gray-500">EXP: {{ formatNumber(element.exp) }}</div>
          </div>
        </div>
      </div>

      <!-- Qi (Khí) -->
      <div class="bg-gray-800/50 rounded p-2 border border-gray-700/50">
        <h3 class="text-sm font-bold text-purple-400 mb-2">
          Khí ({{ qiWithValue?.length || 0 }})
        </h3>
        <div v-if="!qiWithValue || qiWithValue.length === 0" class="text-xs text-gray-500 text-center py-2">
          Chưa có khí
        </div>
        <div v-else class="grid grid-cols-2 gap-2">
          <div
            v-for="q in qiWithValue"
            :key="q.type"
            class="bg-gray-700/30 rounded p-1.5"
          >
            <div class="text-[10px] text-gray-400">{{ formatQi(q.type) }}</div>
            <div class="text-xs font-bold text-purple-400">
              {{ Math.floor(q.amount) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-400 py-4">
      Không thể tải thông tin nhân vật
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { api } from '../../composables/useApi';
import { formatNumber } from '../../utils/formatNumber';

const props = defineProps<{
  characterId: number;
}>();

console.log('🎯 CharacterInfoTab component created with characterId:', props.characterId);

interface CharacterStats {
  display_name: string;
  realm_level: number;
  exp: number;
  base_exp_per_interval: number;
  max_inventory_slots: number;
  last_login_at: string | null;
  primary: {
    luc_dao: number;
    can_cot: number;
    than_phap: number;
    ngo_tinh: number;
    dinh_luc: number;
  };
  hidden: {
    linh_can: 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';
    phuc_duyen: number;
    tam_canh: number;
  };
  combat: {
    hp: number;
    max_hp: number;
    mp: number;
    max_mp: number;
    physical_attack: number;
    magical_attack: number;
    physical_defense: number;
    magical_defense: number;
    critical_chance: number;
    critical_damage: number;
    speed: number;
    dodge: number;
    attack_speed: number;
    carry_capacity: number;
  };
  elements: Array<{
    type: string;
    grade: string;
    level: number;
    exp: number;
  }>;
  qi: Array<{
    type: string;
    amount: number;
    max_amount: number;
    regen_rate: number;
  }>;
}

const stats = ref<CharacterStats | null>(null);
const loading = ref(true);

// Filter qi to only show those with value > 0
const qiWithValue = computed(() => {
  if (!stats.value?.qi) return [];
  return stats.value.qi.filter(q => q.amount > 0);
});

const formatElement = (element: string): string => {
  const map: Record<string, string> = {
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
  return map[element] || element;
};

const formatElementGrade = (grade: string): string => {
  const map: Record<string, string> = {
    pham: 'Phàm',
    linh: 'Linh',
    huyen: 'Huyền',
    dia: 'Địa',
    thien: 'Thiên',
    than: 'Thần',
    tien: 'Tiên',
    thanh: 'Thánh',
    de: 'Đế',
  };
  return map[grade] || grade;
};

const getElementColor = (element: string): string => {
  const map: Record<string, string> = {
    kim: 'text-yellow-400',
    moc: 'text-green-400',
    thuy: 'text-blue-400',
    hoa: 'text-red-400',
    tho: 'text-amber-400',
    loi: 'text-purple-400',
    bang: 'text-cyan-400',
    duong: 'text-orange-400',
    am: 'text-gray-400',
  };
  return map[element] || 'text-gray-300';
};

const formatQi = (qiType: string): string => {
  const map: Record<string, string> = {
    blood_qi: 'Huyết Khí',
    spiritual_qi: 'Văn Khí',
    vital_qi: 'Sinh Khí',
    righteous_qi: 'Chính Khí',
    killing_qi: 'Sát Khí',
    scholarly_qi: 'Văn Khí',
    demonic_qi: 'Ma Khí',
    frost_qi: 'Hàn Khí',
    yang_qi: 'Dương Khí',
    yin_qi: 'Âm Khí',
    impure_qi: 'Tạp Khí',
    prenatal_qi: 'Tiên Thiên Khí',
    grandmist_purple_qi: 'Tử Khí',
    chaos_qi: 'Hỗn Độn Khí',
    imperial_qi: 'Hoàng Khí',
    death_qi: 'Tử Khí',
    aura_qi: 'Khí Vận',
    corpse_qi: 'Thi Khí',
    resentment_qi: 'Oán Khí',
    charm_qi: 'Mỵ Khí',
  };
  return map[qiType] || qiType;
};

const formatDate = (date: string | null): string => {
  if (!date) return 'Chưa đăng nhập';
  try {
    const d = new Date(date);
    return d.toLocaleString('vi-VN');
  } catch {
    return 'Không hợp lệ';
  }
};

const fetchStats = async () => {
  console.log('🔍 fetchStats called with characterId:', props.characterId);
  if (!props.characterId) {
    console.warn('⚠️ No characterId provided');
    return;
  }
  
  loading.value = true;
  try {
    const url = `/stats/character/${props.characterId}`;
    console.log('📡 Fetching from URL:', url);
    const response = await api.get(url);
    console.log('✅ API Response received:', response);
    console.log('📊 Full response.data:', JSON.stringify(response.data, null, 2));
    console.log('📊 Elements:', response.data?.elements);
    console.log('📊 Qi:', response.data?.qi);
    
    // Ensure elements and qi are arrays
    const data = response.data || {};
    stats.value = {
      ...data,
      elements: Array.isArray(data.elements) ? data.elements : [],
      qi: Array.isArray(data.qi) ? data.qi : [],
    };
    
    // Debug: Check if elements and qi are arrays
    if (stats.value) {
      console.log('✅ Stats set successfully');
      console.log('📊 Elements count:', stats.value.elements?.length || 0);
      console.log('📊 Qi count:', stats.value.qi?.length || 0);
      console.log('📊 Elements is array?', Array.isArray(stats.value.elements));
      console.log('📊 Qi is array?', Array.isArray(stats.value.qi));
      if (stats.value.elements && stats.value.elements.length > 0) {
        console.log('📊 First element:', stats.value.elements[0]);
      }
      if (stats.value.qi && stats.value.qi.length > 0) {
        console.log('📊 First qi:', stats.value.qi[0]);
      }
    }
  } catch (error: any) {
    console.error('❌ Error fetching character stats:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    stats.value = null;
  } finally {
    loading.value = false;
  }
};

// Watch for characterId changes
watch(() => props.characterId, (newId, oldId) => {
  console.log('🔄 CharacterId changed from', oldId, 'to', newId);
  fetchStats();
}, { immediate: false });

onMounted(() => {
  console.log('✅ CharacterInfoTab onMounted, characterId:', props.characterId);
  fetchStats();
});
</script>

