<template>
  <div class="combat-view p-2 space-y-2">
    <!-- Tabs -->
    <div class="flex gap-1 border-b border-gray-700">
      <button
        @click="activeTab = 'pve'"
        class="px-3 py-1 text-sm font-semibold transition-colors"
        :class="activeTab === 'pve' 
          ? 'text-purple-400 border-b-2 border-purple-400' 
          : 'text-gray-400 hover:text-gray-300'"
      >
        Đánh Quái
      </button>
      <button
        @click="activeTab = 'pvp'"
        class="px-3 py-1 text-sm font-semibold transition-colors"
        :class="activeTab === 'pvp' 
          ? 'text-purple-400 border-b-2 border-purple-400' 
          : 'text-gray-400 hover:text-gray-300'"
      >
        Đấu Người Chơi
      </button>
    </div>

    <!-- PvE Tab -->
    <div v-if="activeTab === 'pve'" class="space-y-2">
      <!-- Player Skills Info -->
      <div v-if="playerSkills.length > 0" class="bg-gray-800/50 rounded p-2 border border-gray-700/50">
        <div class="text-xs text-gray-400 mb-2">Kỹ năng của bạn (sẽ tự động dùng khi đủ mana và hết cooldown):</div>
        <div class="flex gap-2 flex-wrap">
          <div
            v-for="cs in playerSkills"
            :key="cs.id"
            class="bg-gray-700/30 rounded px-2 py-1 text-xs"
          >
            <span class="text-purple-400 font-semibold">{{ cs.skill.name }}</span>
            <span class="text-gray-500 ml-1">CD: {{ cs.skill.cooldown }}s</span>
            <span class="text-gray-500 ml-1">MP: {{ cs.skill.mana_cost }}</span>
          </div>
        </div>
      </div>

      <div v-if="loadingMonsters" class="text-center text-gray-400 py-4">
        Đang tải danh sách quái vật...
      </div>

      <div v-else-if="monsters.length === 0" class="text-center text-gray-400 py-4">
        Không có quái vật nào
      </div>

      <div v-else class="space-y-2">
        <div class="text-xs text-gray-400 mb-2">
          Chọn quái vật để chiến đấu:
        </div>
        
        <div class="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
          <div
            v-for="monster in monsters"
            :key="monster.id"
            class="bg-gray-800/50 rounded p-2 border border-gray-700/50 hover:border-purple-500/50 transition-colors cursor-pointer"
            @click="startPvECombat(monster.id)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="text-sm font-bold text-purple-400">{{ monster.name }}</div>
                <div class="text-xs text-gray-400 mt-1">{{ monster.description }}</div>
                <div class="flex gap-2 mt-1 flex-wrap">
                  <span class="text-[10px] text-gray-500">Cấp: {{ monster.level }}</span>
                  <span class="text-[10px] text-gray-500">EXP: {{ monster.exp_reward }}</span>
                  <span class="text-[10px] text-gray-500">Vàng: {{ monster.gold_reward }}</span>
                  <span v-if="monster.monsterSkills && monster.monsterSkills.length > 0" class="text-[10px] text-purple-400">
                    {{ monster.monsterSkills.length }} Kỹ năng
                  </span>
                </div>
              </div>
              <button
                class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                :disabled="combatting"
              >
                Chiến Đấu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PvP Tab -->
    <div v-if="activeTab === 'pvp'" class="space-y-2">
      <div class="bg-gray-800/50 rounded p-2 border border-gray-700/50">
        <div class="text-xs text-gray-400 mb-2">
          Nhập ID nhân vật đối thủ để chiến đấu:
        </div>
        <div class="flex gap-2">
          <input
            v-model="opponentId"
            type="number"
            placeholder="ID đối thủ"
            class="flex-1 px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
          />
          <button
            @click="startPvPCombat"
            class="px-4 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
            :disabled="combatting || !opponentId"
          >
            Thách Đấu
          </button>
        </div>
      </div>
    </div>

    <!-- Combat Result Modal -->
    <div
      v-if="combatResult"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      @click.self="combatResult = null"
    >
      <div class="bg-gray-800 rounded-lg p-4 max-w-md w-full mx-4 border border-purple-500/50">
        <div class="text-center mb-4">
          <h3 class="text-lg font-bold mb-2" :class="combatResult.winner === 'player' ? 'text-green-400' : 'text-red-400'">
            {{ combatResult.winner === 'player' ? 'Chiến Thắng!' : combatResult.winner === 'opponent' ? 'Thất Bại!' : 'Hòa!' }}
          </h3>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400">Tổng số hiệp:</span>
            <span class="text-white">{{ combatResult.total_rounds }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">HP còn lại:</span>
            <span class="text-white">{{ combatResult.player_final_hp }} / {{ combatResult.opponent_final_hp }}</span>
          </div>
          <div v-if="combatResult.exp_gained > 0" class="flex justify-between">
            <span class="text-gray-400">EXP nhận được:</span>
            <span class="text-green-400">+{{ combatResult.exp_gained }}</span>
          </div>
          <div v-if="combatResult.gold_gained > 0" class="flex justify-between">
            <span class="text-gray-400">Vàng nhận được:</span>
            <span class="text-yellow-400">+{{ combatResult.gold_gained }}</span>
          </div>
        </div>

        <!-- Combat Log -->
        <div class="mt-4 max-h-48 overflow-y-auto bg-gray-900/50 rounded p-2">
          <div class="text-xs text-gray-400 mb-1">Nhật ký chiến đấu:</div>
          <div class="space-y-1">
            <div
              v-for="(action, idx) in combatResult.rounds.slice(-10)"
              :key="idx"
              class="text-[10px] text-gray-300"
            >
              <span :class="action.attacker === 'player' ? 'text-blue-400' : 'text-red-400'">
                {{ action.attacker === 'player' ? 'Bạn' : 'Đối thủ' }}
              </span>
              : {{ action.message }}
              <span v-if="action.skill_name" class="text-purple-400 font-semibold"> [{{ action.skill_name }}]</span>
              <span v-if="action.buffs_applied && action.buffs_applied.length > 0" class="text-green-400 text-xs ml-1">
                (Buffs: {{ action.buffs_applied.map((b: any) => `${b.stat_type} ${b.value > 0 ? '+' : ''}${b.value}${b.value_type === 'percentage' ? '%' : ''}`).join(', ') }})
              </span>
              <span v-if="action.is_critical" class="text-red-500"> (Bạo kích!)</span>
              <span v-if="action.is_dodged" class="text-yellow-500"> (Né tránh!)</span>
            </div>
          </div>
        </div>

        <button
          @click="combatResult = null"
          class="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../composables/useApi';

const props = defineProps<{
  characterId: number;
}>();

const activeTab = ref<'pve' | 'pvp'>('pve');
const monsters = ref<any[]>([]);
const loadingMonsters = ref(true);
const combatting = ref(false);
const opponentId = ref<number | null>(null);
const combatResult = ref<any>(null);
const playerSkills = ref<any[]>([]);

const fetchMonsters = async () => {
  loadingMonsters.value = true;
  try {
    const response = await api.get('/monsters');
    const monstersData = response.data || [];
    
    // Fetch skills for each monster
    for (const monster of monstersData) {
      try {
        const skillsResponse = await api.get(`/monsters/${monster.id}/skills`);
        monster.monsterSkills = skillsResponse.data || [];
      } catch (error) {
        console.error(`Error fetching skills for monster ${monster.id}:`, error);
        monster.monsterSkills = [];
      }
    }
    
    monsters.value = monstersData;
  } catch (error) {
    console.error('Error fetching monsters:', error);
    monsters.value = [];
  } finally {
    loadingMonsters.value = false;
  }
};

const startPvECombat = async (monsterId: number) => {
  if (combatting.value) return;
  
  combatting.value = true;
  try {
    const response = await api.post('/combat/pve', {
      character_id: props.characterId,
      monster_id: monsterId,
    });
    combatResult.value = response.data;
  } catch (error: any) {
    console.error('Error starting PvE combat:', error);
    alert(error.response?.data?.message || 'Không thể bắt đầu chiến đấu');
  } finally {
    combatting.value = false;
  }
};

const startPvPCombat = async () => {
  if (combatting.value || !opponentId.value) return;
  
  combatting.value = true;
  try {
    const response = await api.post('/combat/pvp', {
      character_id: props.characterId,
      opponent_id: opponentId.value,
    });
    combatResult.value = response.data;
  } catch (error: any) {
    console.error('Error starting PvP combat:', error);
    alert(error.response?.data?.message || 'Không thể bắt đầu chiến đấu');
  } finally {
    combatting.value = false;
  }
};

const fetchPlayerSkills = async () => {
  if (!props.characterId) return;
  try {
    const response = await api.get(`/skills/character/${props.characterId}`);
    playerSkills.value = response.data || [];
  } catch (error) {
    console.error('Error fetching player skills:', error);
    playerSkills.value = [];
  }
};

onMounted(() => {
  fetchMonsters();
  fetchPlayerSkills();
});
</script>

