<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useCharacter } from "../composables/useCharacter";
import { useAuth } from "../composables/useAuth";
import { api } from "../composables/useApi";
import ExpBar from "../components/ExpBar.vue";
import CharacterView from "../components/CharacterView.vue";
import MainLayout from "../components/MainLayout.vue";
import FixedGameMenu from "../components/FixedGameMenu.vue";
import GameNavigation from "../components/GameNavigation.vue";
import AchievementsList from "../components/achievements/AchievementsList.vue";
import ShopView from "../components/shop/ShopView.vue";
import SkillsTree from "../components/skills/SkillsTree.vue";
import LeaderboardView from "../components/leaderboard/LeaderboardView.vue";
import FriendsList from "../components/friends/FriendsList.vue";
import NotificationsList from "../components/notifications/NotificationsList.vue";
import InventoryView from "../components/inventory/InventoryView.vue";
import EquipmentView from "../components/equipment/EquipmentView.vue";
import LoginForm from "../components/LoginForm.vue";
import RegisterForm from "../components/RegisterForm.vue";

const {
  authState,
  isAuthenticated,
  checkAuth,
} = useAuth();
const { character, loading, fetchCharacter, realmDisplay } = useCharacter();

const currentView = ref<string>("character");
const authMode = ref<"login" | "register">("login");
const currencies = ref<any[]>([]);

const characterId = computed(
  () => character.value?.id || authState.value.character?.id || 0
);

// Update character from auth state
watch(
  () => authState.value.character,
  (newChar) => {
    if (newChar) {
      character.value = newChar;
    }
  },
  { immediate: true }
);

const handleLoginSuccess = async () => {
  await checkAuth();
  if (authState.value.character) {
    character.value = authState.value.character;
  } else {
    await fetchCharacter();
  }
};

const handleRegisterSuccess = async () => {
  await handleLoginSuccess();
};

// Handle EXP gained event - update character EXP without full reload
const handleExpGained = async () => {
  if (characterId.value > 0) {
    await fetchCharacter();
  }
};

// Calculate EXP required for next realm level
// Formula matches backend: Math.floor(1000 * Math.pow(realm_level, 1.5))
const calculateExpRequired = (realmLevel: number): number => {
  // Next level is realmLevel + 1
  const nextLevel = realmLevel + 1;
  return Math.floor(1000 * Math.pow(nextLevel, 1.5));
};

// Handle feature click from GameNavigation
const handleFeatureClick = (featureId: string, viewId?: string) => {
  console.log('Feature clicked:', featureId, 'viewId:', viewId);
  if (viewId) {
    currentView.value = viewId;
  }
};

// Fetch currencies
const fetchCurrencies = async () => {
  if (characterId.value > 0) {
    try {
      const response = await api.get(`/currency/character/${characterId.value}`);
      currencies.value = response.data || [];
    } catch (error) {
      console.error("Error fetching currencies:", error);
      currencies.value = [];
    }
  }
};

// Drag functionality
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const scrollLeft = ref(0);
const scrollTop = ref(0);

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true;
  dragStartX.value = e.pageX;
  dragStartY.value = e.pageY;
  const target = e.target as HTMLElement;
  const scrollContainer = target.closest('.overflow-auto, .overflow-x-auto, .overflow-y-auto') as HTMLElement;
  if (scrollContainer) {
    scrollLeft.value = scrollContainer.scrollLeft;
    scrollTop.value = scrollContainer.scrollTop;
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  const deltaX = e.pageX - dragStartX.value;
  const deltaY = e.pageY - dragStartY.value;
  const target = e.target as HTMLElement;
  const scrollContainer = target.closest('.overflow-auto, .overflow-x-auto, .overflow-y-auto') as HTMLElement;
  if (scrollContainer) {
    scrollContainer.scrollLeft = scrollLeft.value - deltaX;
    scrollContainer.scrollTop = scrollTop.value - deltaY;
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
};

// Watch characterId to fetch currencies
watch(characterId, (newId) => {
  if (newId > 0) {
    fetchCurrencies();
  }
}, { immediate: true });

// Fetch currencies on mount
onMounted(async () => {
  console.log('GameApp onMounted - Starting...');
  try {
    const authResult = await checkAuth();
    console.log('checkAuth result:', authResult);
    console.log('isAuthenticated:', isAuthenticated.value);
    console.log('authState:', authState.value);
    
    if (isAuthenticated.value) {
      // Nếu đã có character trong authState, không cần fetch lại
      if (authState.value.character) {
        console.log('Using character from authState:', authState.value.character);
        character.value = authState.value.character;
        loading.value = false;
      } else {
        console.log('No character in authState, fetching...');
        await fetchCharacter();
      }
      await fetchCurrencies();
    } else {
      // Nếu không authenticated, set loading = false để hiển thị login form
      console.log('Not authenticated, showing login form');
      loading.value = false;
    }
  } catch (error) {
    console.error('Error in onMounted:', error);
    loading.value = false;
  }
  console.log('GameApp onMounted - Finished. Loading:', loading.value);
});

onUnmounted(() => {
  // Cleanup if needed
});
</script>

<template>
  <div class="w-full h-full bg-dao-bg font-sans">
    <!-- Show login/register if not authenticated -->
    <div
      v-if="!isAuthenticated"
      class="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-4"
    >
      <div class="w-full max-w-md">
        <div class="text-center mb-6">
          <h1
            class="text-2xl font-thu-phap font-bold text-purple-400 mb-2 text-glow-purple"
          >
            Đạo Thể Chân Tiên
          </h1>
          <p class="text-gray-400 text-sm">Vui lòng đăng nhập để tiếp tục</p>
        </div>
        <LoginForm
          v-if="authMode === 'login'"
          @switch-to-register="authMode = 'register'"
          @login-success="handleLoginSuccess"
        />
        <RegisterForm
          v-else
          @switch-to-login="authMode = 'login'"
          @register-success="handleRegisterSuccess"
        />
      </div>
    </div>

    <!-- Show loading if loading -->
    <div
      v-else-if="loading"
      class="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
    >
      <div class="text-gray-400 animate-pulse text-center">
        <div class="flex items-center justify-center gap-2">
          <div class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span>Đang cảm nhận thiên địa linh khí...</span>
        </div>
      </div>
    </div>

    <!-- Fallback: Authenticated but no character -->
    <div
      v-else-if="isAuthenticated && !character && !loading"
      class="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
    >
      <div class="text-center text-gray-400">
        <p class="mb-4">Không tìm thấy nhân vật. Vui lòng tạo nhân vật mới.</p>
        <button
          @click="fetchCharacter"
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
        >
          Tải lại
        </button>
      </div>
    </div>

    <!-- Main Layout with Fixed Game Menu (for all authenticated views) -->
    <MainLayout v-else-if="isAuthenticated && character">
      <!-- Header Slot: Title + Quick Nav + Player Info -->
      <template #header>
        <FixedGameMenu
          :character="character"
          :currencies="currencies"
          :realm-display="realmDisplay"
          :current-view="currentView"
          :show-player-info="true"
        />
      </template>

      <!-- Main Content Slot: Nội dung thay đổi tùy theo trang -->
      <div
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      >
        <!-- Character View Content -->
        <div v-if="currentView === 'character'">
          <CharacterView
            :character="character"
            :characterId="characterId"
            @exp-updated="handleExpGained"
            @switch-view="currentView = $event"
          />
        </div>

        <!-- Other Views -->
        <div v-else class="space-y-4">
          <EquipmentView
            v-if="currentView === 'equipment'"
            :characterId="characterId"
          />
          <AchievementsList
            v-if="currentView === 'achievements'"
            :characterId="characterId"
          />
          <ShopView v-if="currentView === 'shop'" :characterId="characterId" />
          <SkillsTree
            v-if="currentView === 'skills'"
            :characterId="characterId"
          />
          <LeaderboardView v-if="currentView === 'leaderboard'" />
          <FriendsList
            v-if="currentView === 'friends'"
            :characterId="characterId"
          />
          <NotificationsList
            v-if="currentView === 'notifications'"
            :characterId="characterId"
          />
          <InventoryView
            v-if="currentView === 'inventory'"
            :characterId="characterId"
          />
        </div>
      </div>

      <!-- Footer Slot: GameNavigation + EXP Bar -->
      <template #footer>
        <!-- GameNavigation -->
        <GameNavigation
          @feature-click="handleFeatureClick"
        />
        <!-- EXP Bar -->
        <ExpBar
          v-if="character"
          :exp="character.exp || 0"
          :exp-required="calculateExpRequired(character.realm_level)"
          @exp-updated="handleExpGained"
        />
      </template>
    </MainLayout>
  </div>
</template>

