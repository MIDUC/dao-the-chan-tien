<template>
  <div class="character-view w-full">
    <!-- Main Content Area -->
    <div class="w-full">
      <!-- Central Character Area -->
      <CharacterDisplay
        :can-breakthrough="canBreakthrough"
        @open-breakthrough="showBreakthroughModal = true"
      />

      <!-- Character Stats -->
      <CharacterStats
        :realm-display="realmDisplay"
        :mystic-power="calculateMysticPower()"
        :exp="character.exp"
        :exp-required="getExpRequired(character.realm_level)"
      />

      <!-- Breakthrough Modal -->
      <BreakthroughModal
        :show="showBreakthroughModal"
        :character-id="characterId"
        @close="showBreakthroughModal = false"
        @breakthrough="handleBreakthrough"
      />

      <!-- Status Table -->
      <StatusTable :character-id="characterId" />

      <!-- Equipment View -->
      <EquipmentView :character-id="characterId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { formatRealm } from "../utils/realm";
import { useCharacter } from "../composables/useCharacter";
import CharacterDisplay from "./character-view/CharacterDisplay.vue";
import CharacterStats from "./character-view/CharacterStats.vue";
import StatusTable from "./character-view/StatusTable.vue";
import BreakthroughModal from "./character-view/BreakthroughModal.vue";
import EquipmentView from "./equipment/EquipmentView.vue";

interface Character {
  id: number;
  display_name: string;
  realm_level: number;
  exp: number;
  strength: number;
  agility: number;
  wisdom: number;
}

const props = defineProps<{
  character: Character;
  characterId: number;
}>();

const emit = defineEmits<{
  "exp-updated": [];
  "switch-view": [viewId: string];
}>();

const realmDisplay = computed(() => formatRealm(props.character.realm_level));

const calculateMysticPower = (): number => {
  // Simple calculation based on stats and realm level
  const basePower =
    props.character.strength + props.character.agility + props.character.wisdom;
  return basePower * props.character.realm_level * 100;
};

const { fetchCharacter } = useCharacter();
const showBreakthroughModal = ref(false);

// For now, use sync calculation (can be improved to fetch from API)
const getExpRequired = (realmLevel: number): number => {
  return Math.floor(1000 * Math.pow(realmLevel, 1.5));
};

const canBreakthrough = computed(() => {
  if (!props.character.exp || !getExpRequired(props.character.realm_level))
    return false;
  return props.character.exp >= getExpRequired(props.character.realm_level);
});

const handleBreakthrough = async () => {
  await fetchCharacter();
  emit("exp-updated");
};
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
