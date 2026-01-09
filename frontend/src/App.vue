<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useCharacter } from "./composables/useCharacter";
import { useAuth } from "./composables/useAuth";
import { formatNumber } from "./utils/formatNumber";
import { api } from "./composables/useApi";
import ExpBar from "./components/ExpBar.vue";
import CharacterView from "./components/CharacterView.vue";
import MainLayout from "./components/MainLayout.vue";
import FixedGameMenu from "./components/FixedGameMenu.vue";
import GameNavigation from "./components/GameNavigation.vue";
import AchievementsList from "./components/achievements/AchievementsList.vue";
import ShopView from "./components/shop/ShopView.vue";
import SkillsTree from "./components/skills/SkillsTree.vue";
import LeaderboardView from "./components/leaderboard/LeaderboardView.vue";
import FriendsList from "./components/friends/FriendsList.vue";
import NotificationsList from "./components/notifications/NotificationsList.vue";
import InventoryView from "./components/inventory/InventoryView.vue";
import LoginForm from "./components/LoginForm.vue";
import RegisterForm from "./components/RegisterForm.vue";
import AdminPanel from "./components/AdminPanel.vue";

const {
  authState,
  isAuthenticated,
  isAdmin,
  login,
  register,
  logout,
  checkAuth,
} = useAuth();
const { character, loading, fetchCharacter, realmDisplay } = useCharacter();

const currentView = ref<string>("character");
const authMode = ref<"login" | "register">("login");
const currencies = ref<any[]>([]);

const views = computed(() => [
  { id: "character", label: "Nhân Vật", icon: "🧘" },
  { id: "achievements", label: "Thành Tựu", icon: "🏆" },
  { id: "shop", label: "Cửa Hàng", icon: "🛒" },
  { id: "skills", label: "Kỹ Năng", icon: "⚔️" },
  { id: "leaderboard", label: "Xếp Hạng", icon: "📊" },
  { id: "friends", label: "Bạn Bè", icon: "👥" },
  { id: "notifications", label: "Thông Báo", icon: "🔔" },
  ...(isAdmin.value ? [{ id: "admin", label: "Admin", icon: "⚙️" }] : []),
]);

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
    // Lightweight sync: only fetch EXP and realm_level from server
    // This avoids reloading entire character data (prevents screen flicker)
    try {
      const response = await api.get(`/characters/${characterId.value}/exp`);
      if (response.data) {
        const oldExp = character.value?.exp || 0;
        const oldLevel = character.value?.realm_level || 0;

        // Update character from useCharacter composable
        if (character.value) {
          character.value.exp = response.data.exp;
          character.value.realm_level = response.data.realm_level;
        }
        // Also update authState.character to keep it in sync
        if (authState.value.character) {
          authState.value.character.exp = response.data.exp;
          authState.value.character.realm_level = response.data.realm_level;
        }

        // Log if EXP or level changed
        if (
          response.data.exp !== oldExp ||
          response.data.realm_level !== oldLevel
        ) {
          console.log(
            `📈 EXP updated: ${oldExp} → ${response.data.exp}, Level: ${oldLevel} → ${response.data.realm_level}`
          );
        }
      }
    } catch (error) {
      console.error("Error syncing EXP:", error);
    }
  }
};

// Calculate EXP required for next level
const getExpRequired = (realmLevel: number): number => {
  // Base formula: 1000 * (realm_level ^ 1.5)
  // This ensures exponential growth
  return Math.floor(1000 * Math.pow(realmLevel, 1.5));
};

// Track if user is dragging to prevent accidental clicks
let isDraggingNav = false;
let dragStartX = 0;
let dragStartY = 0;
const DRAG_THRESHOLD = 5; // pixels

// Handle view click - only change if not dragging
const handleViewClick = (viewId: string, e: MouseEvent) => {
  // Check if this was a drag gesture
  if (isDraggingNav) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  currentView.value = viewId;
};

// Drag to scroll functionality for content area
const isDragging = ref(false);
const startY = ref(0);
const scrollTop = ref(0);
let scrollContainer: HTMLElement | null = null;

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true;
  const target = e.currentTarget as HTMLElement;
  startY.value = e.pageY - target.offsetTop;
  scrollTop.value = target.scrollTop;
  scrollContainer = target;
  target.style.cursor = "grabbing";
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !scrollContainer) return;
  e.preventDefault();
  const y = e.pageY - scrollContainer.offsetTop;
  const walk = (y - startY.value) * 2;
  scrollContainer.scrollTop = scrollTop.value - walk;
};

const handleMouseUp = () => {
  isDragging.value = false;
  if (scrollContainer) {
    scrollContainer.style.cursor = "grab";
  }
  scrollContainer = null;
};

// Drag to scroll for navigation (horizontal)
const isNavDragging = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);
let navContainer: HTMLElement | null = null;

const handleNavMouseDown = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement;
  dragStartX = e.pageX;
  dragStartY = e.pageY;
  isDraggingNav = false;

  startX.value = e.pageX - target.offsetLeft;
  scrollLeft.value = target.scrollLeft;
  navContainer = target;
  target.style.cursor = "grabbing";
};

const handleNavMouseMove = (e: MouseEvent) => {
  if (!navContainer) return;

  // Check if user is dragging (moved more than threshold)
  const deltaX = Math.abs(e.pageX - dragStartX);
  const deltaY = Math.abs(e.pageY - dragStartY);

  if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
    isDraggingNav = true;
    isNavDragging.value = true;
    e.preventDefault();
    const x = e.pageX - navContainer.offsetLeft;
    const walk = (x - startX.value) * 2;
    navContainer.scrollLeft = scrollLeft.value - walk;
  }
};

const handleNavMouseUp = () => {
  // Small delay to prevent click after drag
  setTimeout(() => {
    isDraggingNav = false;
  }, 100);

  isNavDragging.value = false;
  if (navContainer) {
    navContainer.style.cursor = "grab";
  }
  navContainer = null;
};

// Handle wheel scroll for smooth horizontal scrolling
const handleNavWheel = (e: WheelEvent) => {
  if (!navContainer) return;
  e.preventDefault();
  navContainer.scrollLeft += e.deltaY;
};

const fetchCurrencies = async () => {
  if (characterId.value > 0) {
    try {
      const response = await api.get(
        `/currency/character/${characterId.value}`
      );
      currencies.value = response.data || [];
    } catch (error) {
      console.error("Error fetching currencies:", error);
      currencies.value = [];
    }
  }
};

const handleQuickViewClick = (viewId: string) => {
  currentView.value = viewId;
};

const handleFeatureClick = (featureId: string, viewId?: string) => {
  if (viewId) {
    currentView.value = viewId;
  }
};

// Auto-refresh EXP interval - managed globally to persist across view changes
let expRefreshInterval: ReturnType<typeof setInterval> | null = null;
const cultivationIntervalSeconds = ref<number>(30); // Default 30 seconds

// Fetch cultivation interval from system config
const fetchCultivationInterval = async () => {
  try {
    const response = await api.get(
      "/system-config/cultivation_interval_seconds"
    );
    if (response.data && response.data.value) {
      const interval = parseInt(response.data.value, 10);
      if (!isNaN(interval) && interval > 0) {
        cultivationIntervalSeconds.value = interval;
        console.log(`📊 Cultivation interval: ${interval} seconds`);
      }
    }
  } catch (error) {
    console.warn(
      "Could not fetch cultivation_interval_seconds, using default 30s:",
      error
    );
    cultivationIntervalSeconds.value = 30; // Fallback to 30 seconds
  }
};

// Setup auto-refresh EXP when authenticated and characterId is available
const setupExpAutoRefresh = () => {
  // Clear existing interval if any
  if (expRefreshInterval) {
    clearInterval(expRefreshInterval);
    expRefreshInterval = null;
  }

  // Start new interval if authenticated and has character
  if (isAuthenticated.value && characterId.value > 0) {
    const intervalMs = cultivationIntervalSeconds.value * 1000;
    expRefreshInterval = setInterval(async () => {
      // Double check authentication and characterId before fetching
      if (isAuthenticated.value && characterId.value > 0) {
        await handleExpGained();
      }
    }, intervalMs);
    console.log(
      `✅ Auto-refresh EXP started (every ${cultivationIntervalSeconds.value}s)`
    );
  }
};

// Watch for changes in authentication, characterId, or cultivation interval to restart interval
watch(
  [isAuthenticated, characterId, cultivationIntervalSeconds],
  () => {
    setupExpAutoRefresh();
  },
  { immediate: false } // Don't run immediately, wait for config to be fetched
);

onMounted(async () => {
  const authenticated = await checkAuth();
  if (authenticated && authState.value.character) {
    character.value = authState.value.character;
  } else if (authenticated) {
    await fetchCharacter();
  }

  await fetchCurrencies();

  // Fetch cultivation interval config first
  await fetchCultivationInterval();

  // Setup auto-refresh after config is loaded
  setupExpAutoRefresh();

  // Cleanup interval on unmount
  onUnmounted(() => {
    if (expRefreshInterval) {
      clearInterval(expRefreshInterval);
      expRefreshInterval = null;
      console.log("🛑 Auto-refresh EXP stopped");
    }
  });

  // Listen for character updates (e.g., from offline cultivation)
  window.addEventListener("character-updated", async () => {
    await fetchCharacter();
    await fetchCurrencies();
  });

  // Set cursor style for scrollable content
  setTimeout(() => {
    const contentArea = document.querySelector(".flex-1.overflow-y-auto");
    if (contentArea) {
      (contentArea as HTMLElement).style.cursor = "grab";
    }
    // Set cursor for navigation
    const navArea = document.querySelector(".overflow-x-auto.scrollbar-hide");
    if (navArea) {
      (navArea as HTMLElement).style.cursor = "grab";
    }
  }, 100);
});

watch(characterId, async () => {
  await fetchCurrencies();
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

    <!-- Main Layout with Fixed Game Menu (for all authenticated views) -->
    <MainLayout v-else-if="character">
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
          <AdminPanel v-if="currentView === 'admin' && isAdmin" />
        </div>
      </div>

      <!-- Footer Slot: GameNavigation + EXP Bar -->
      <template #footer>
        <!-- GameNavigation -->
        <GameNavigation @feature-click="handleFeatureClick" />
      </template>
    </MainLayout>

    <!-- Show error if no character -->
    <div
      v-else
      class="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-4"
    >
      <div class="text-center">
        <p class="text-red-400 mb-2">Chưa tìm thấy Đạo hữu.</p>
        <p class="text-sm text-gray-500">
          Hãy chắc chắn bạn đã chạy lệnh 'npm run seed' ở backend.
        </p>
      </div>
    </div>
  </div>
</template>
