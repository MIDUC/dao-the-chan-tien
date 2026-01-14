<template>
  <div class="ancient-artifact-card border-2 border-purple-500 rounded-lg p-4 bg-purple-500/10">
    <div class="flex items-start justify-between mb-2">
      <div class="flex-1">
        <h4 class="text-sm font-semibold text-purple-300 mb-1">
          {{ artifact.item.name }}
        </h4>
        <img
          v-if="artifact.item.icon_url"
          :src="artifact.item.icon_url"
          :alt="artifact.item.name"
          class="w-16 h-16 mx-auto mb-2"
        />
      </div>
      <button
        @click="$emit('unequip', artifact.id)"
        class="text-red-400 hover:text-red-300 text-xs"
      >
        ✕
      </button>
    </div>

    <!-- Stats -->
    <div v-if="artifact.stats" class="text-xs space-y-1 mb-2">
      <div v-if="artifact.stats.strength" class="text-green-400">
        +{{ artifact.stats.strength }} Sức mạnh
      </div>
      <div v-if="artifact.stats.agility" class="text-green-400">
        +{{ artifact.stats.agility }} Nhanh nhẹn
      </div>
      <div v-if="artifact.stats.wisdom" class="text-green-400">
        +{{ artifact.stats.wisdom }} Trí tuệ
      </div>
      <div v-if="artifact.stats.hp" class="text-green-400">
        +{{ artifact.stats.hp }} HP
      </div>
      <div v-if="artifact.stats.defense" class="text-green-400">
        +{{ artifact.stats.defense }} Phòng thủ
      </div>
    </div>

    <!-- Effects (Tác dụng) -->
    <div v-if="artifact.effects" class="text-xs space-y-1 mb-2 border-t border-purple-500/30 pt-2">
      <div class="text-blue-300 font-semibold mb-1">Tác dụng:</div>
      <div v-if="artifact.effects.attack_bonus" class="text-blue-400">
        +{{ artifact.effects.attack_bonus }} Tấn công
      </div>
      <div v-if="artifact.effects.defense_bonus" class="text-blue-400">
        +{{ artifact.effects.defense_bonus }} Phòng thủ
      </div>
      <div v-if="artifact.effects.hp_bonus" class="text-blue-400">
        +{{ artifact.effects.hp_bonus }} HP
      </div>
      <div v-if="artifact.effects.mp_bonus" class="text-blue-400">
        +{{ artifact.effects.mp_bonus }} MP
      </div>
      <div v-if="artifact.effects.crit_chance" class="text-blue-400">
        +{{ artifact.effects.crit_chance }}% Bạo kích
      </div>
      <div v-if="artifact.effects.speed_bonus" class="text-blue-400">
        +{{ artifact.effects.speed_bonus }} Tốc độ
      </div>
    </div>

    <!-- Penalties (Tác hại) -->
    <div v-if="artifact.penalties" class="text-xs space-y-1 border-t border-red-500/30 pt-2">
      <div class="text-red-300 font-semibold mb-1">Tác hại:</div>
      <div v-if="artifact.penalties.hp_loss_per_attack" class="text-red-400">
        -{{ artifact.penalties.hp_loss_per_attack }} HP mỗi lần tấn công
      </div>
      <div v-if="artifact.penalties.mp_loss_per_skill" class="text-red-400">
        -{{ artifact.penalties.mp_loss_per_skill }} MP mỗi lần dùng skill
      </div>
      <div v-if="artifact.penalties.hp_drain_per_second" class="text-red-400">
        -{{ artifact.penalties.hp_drain_per_second }} HP/giây
      </div>
      <div v-if="artifact.penalties.mp_drain_per_second" class="text-red-400">
        -{{ artifact.penalties.mp_drain_per_second }} MP/giây
      </div>
      <div v-if="artifact.penalties.defense_reduction" class="text-red-400">
        -{{ artifact.penalties.defense_reduction }} Phòng thủ
      </div>
      <div v-if="artifact.penalties.speed_reduction" class="text-red-400">
        -{{ artifact.penalties.speed_reduction }} Tốc độ
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AncientArtifact {
  id: number;
  item: {
    id: number;
    name: string;
    icon_url?: string;
  };
  stats?: any;
  effects?: any;
  penalties?: any;
}

defineProps<{
  artifact: AncientArtifact;
  characterId: number;
}>();

defineEmits<{
  unequip: [artifactId: number];
}>();
</script>

