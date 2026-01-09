<template>
  <div
    class="bg-gray-800 p-4 rounded-lg border"
    :class="isUnlocked ? 'border-green-500' : 'border-gray-700'"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h3 class="font-bold text-white mb-1">{{ skill.name }}</h3>
        <p class="text-sm text-gray-400 mb-2">{{ skill.description }}</p>
        <div class="flex gap-2 mb-2">
          <span class="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
            {{ getSkillTypeName(skill.skill_type) }}
          </span>
          <span class="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
            {{ getCategoryName(skill.category) }}
          </span>
        </div>
        <div v-if="isUnlocked" class="text-xs text-green-400 mb-2">
          Đã học - Level {{ skillLevel }}
        </div>
        <button
          v-else
          @click="$emit('unlock-skill', skill.id)"
          class="bg-dao-qi hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          Học kỹ năng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Skill {
  id: number;
  name: string;
  description: string;
  skill_type: string;
  category: string;
  max_level: number;
}

const props = defineProps<{
  skill: Skill;
  isUnlocked: boolean;
  skillLevel: number;
}>();

defineEmits<{
  'unlock-skill': [skillId: number];
}>();

const getSkillTypeName = (type: string) => {
  const names: Record<string, string> = {
    passive: 'Thụ động',
    active: 'Chủ động',
    ultimate: 'Tối thượng',
  };
  return names[type] || type;
};

const getCategoryName = (category: string) => {
  const names: Record<string, string> = {
    combat: 'Chiến đấu',
    cultivation: 'Tu luyện',
    crafting: 'Chế tạo',
    social: 'Xã hội',
  };
  return names[category] || category;
};
</script>

