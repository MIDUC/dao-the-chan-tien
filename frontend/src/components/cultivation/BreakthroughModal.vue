<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
      @click.self="handleClose"
    >
      <div
        class="relative w-full max-w-xs mx-4 overflow-hidden rounded-2xl border border-gray-800/50 bg-black/95 shadow-2xl"
      >
        <!-- Header -->
        <div
          class="relative flex items-center justify-between px-6 py-4 border-b border-gray-800/50"
        >
          <h2
            class="text-xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500"
          >
            Đột Phá Cảnh Giới
          </h2>
          <button
            @click="handleClose"
            class="w-6 h-6 flex items-center justify-center transition-transform hover:rotate-90 opacity-70 hover:opacity-100"
            :disabled="phase === 'channeling'"
          >
            <img
              :src="closeButtonImage"
              alt="Đóng"
              class="w-full h-full object-contain"
            />
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 relative min-h-[200px] flex flex-col">
          <!-- PREPARE Phase -->
          <div
            v-if="phase === 'prepare' && localBreakthroughData"
            class="flex flex-col items-center justify-center"
          >
            <!-- Success Rate SVG Circle with Breakthrough Button -->
            <div class="flex flex-col items-center justify-center py-4">
              <div class="relative w-36 h-36 flex items-center justify-center">
                <svg class="w-full h-full transform -rotate-90">
                  <!-- Background circle -->
                  <circle
                    cx="72"
                    cy="72"
                    r="68"
                    stroke="currentColor"
                    stroke-width="4"
                    fill="transparent"
                    class="text-gray-800"
                  />
                  <!-- Progress circle -->
                  <circle
                    cx="72"
                    cy="72"
                    r="68"
                    stroke="currentColor"
                    stroke-width="4"
                    fill="transparent"
                    :class="successRateColor"
                    :stroke-dasharray="427"
                    :stroke-dashoffset="427 - (427 * successRate) / 100"
                    class="transition-all duration-1000 ease-out"
                    stroke-linecap="round"
                  />
                </svg>

                <!-- Center Content: Rate + Button -->
                <div
                  class="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <!-- Success Rate Text -->
                  <div class="mb-2">
                    <div
                      class="text-3xl font-bold font-serif leading-none"
                      :class="successRateColor"
                    >
                      {{ successRate }}%
                    </div>
                  </div>

                  <!-- Breakthrough Button -->
                  <button
                    @click="startBreakthrough"
                    :disabled="!localBreakthroughData.canBreakthrough"
                    class="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
                    :class="
                      localBreakthroughData.canBreakthrough
                        ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/50'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    "
                  >
                    ĐỘT PHÁ
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- CHANNELING Phase -->
          <div
            v-else-if="phase === 'channeling'"
            class="flex flex-col items-center justify-center h-full space-y-8 py-12"
          >
            <!-- Spinner Animation -->
            <div class="relative">
              <div
                class="w-32 h-32 rounded-full border-4 border-yellow-500/20 animate-spin-slow"
              ></div>
              <div
                class="absolute inset-0 w-32 h-32 rounded-full border-t-4 border-yellow-400 animate-spin"
              ></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-5xl">🧘</span>
              </div>
            </div>

            <!-- Channeling Text -->
            <div class="text-center space-y-3">
              <h3
                class="text-2xl font-bold text-yellow-100 animate-pulse font-serif"
              >
                {{ channelingText }}
              </h3>
              <p class="text-sm text-gray-400">{{ channelingSubtext }}</p>
            </div>

            <!-- Progress Bar -->
            <div class="w-full max-w-xs space-y-2">
              <div
                class="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700"
              >
                <div
                  class="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300 ease-out rounded-full"
                  :style="{ width: channelingProgress + '%' }"
                ></div>
              </div>
              <div class="text-xs text-gray-500 text-center">
                {{ channelingProgress }}%
              </div>
            </div>
          </div>

          <!-- RESULT Phase -->
          <div
            v-else-if="phase === 'result'"
            class="flex flex-col items-center justify-center h-full text-center space-y-6 py-12"
            :class="
              resultSuccess ? 'animate-zoom-in-gold' : 'animate-zoom-in-red'
            "
          >
            <!-- Result Icon -->
            <div class="text-7xl drop-shadow-2xl">
              {{ resultSuccess ? "🌟" : "💀" }}
            </div>

            <!-- Result Title -->
            <h3
              class="text-3xl font-bold mb-2 font-serif"
              :class="
                resultSuccess
                  ? 'text-yellow-400 drop-shadow-lg'
                  : 'text-red-500 drop-shadow-lg'
              "
            >
              {{ resultSuccess ? "Đột Phá Thành Công!" : "Đột Phá Thất Bại" }}
            </h3>

            <!-- Result Message -->
            <p
              class="text-gray-300 mb-6 px-4 text-lg"
              :class="resultSuccess ? 'text-yellow-100' : 'text-red-200'"
            >
              {{ resultMessage }}
            </p>

            <!-- Success Info -->
            <div
              v-if="resultSuccess && localBreakthroughData"
              class="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6 w-full max-w-xs"
            >
              <div class="text-sm text-yellow-200 mb-1">Cảnh giới mới</div>
              <div class="text-2xl font-bold text-white">
                Cấp {{ localBreakthroughData.nextLevel?.level }}
              </div>
              <div class="text-xs text-yellow-300/80 mt-1">
                {{ localBreakthroughData.nextLevel?.name }}
              </div>
            </div>

            <!-- Close Button -->
            <button
              @click="handleClose"
              class="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors font-semibold"
            >
              Đóng
            </button>
          </div>

          <!-- Loading Overlay -->
          <div
            v-if="loading"
            class="absolute inset-0 flex items-center justify-center bg-black/90 z-10"
          >
            <div class="text-yellow-500 text-lg">Đang lấy dữ liệu...</div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { api } from "../../composables/useApi";
import closeButtonImage from "../../assets/Gemini_Generated_Image_xcq5h0xcq5h0xcq5-removebg-preview.png";

// Props & Emits
const props = defineProps<{
  show: boolean;
  characterId: number;
  breakthroughData?: any; // Optional: can be passed from parent or fetched internally
}>();

const emit = defineEmits<{
  close: [];
  "breakthrough-success": [];
}>();

// State Management
type Phase = "prepare" | "channeling" | "result";
const phase = ref<Phase>("prepare");
const loading = ref(false);
const localBreakthroughData = ref<any>(props.breakthroughData || null);

// Channeling Phase State
const channelingProgress = ref(0);
const channelingText = ref("Đang vận khí...");
const channelingSubtext = ref("Hội tụ linh khí trong kinh mạch");

// Result Phase State
const resultSuccess = ref(false);
const resultMessage = ref("");

// Success Rate Calculation
const successRate = computed(() => {
  if (!localBreakthroughData.value?.requirements) return 0;
  const reqs = localBreakthroughData.value.requirements;
  if (reqs.length === 0) return 100;

  // Calculate average success rate from requirements
  let totalMin = 0;
  let totalMax = 0;
  let count = 0;

  reqs.forEach((req: any) => {
    if (req.success_rate) {
      totalMin += req.success_rate.min || 0;
      totalMax += req.success_rate.max || 0;
      count++;
    }
  });

  if (count === 0) return 50; // Default if no success_rate

  const avgMin = (totalMin / count) * 100;
  const avgMax = (totalMax / count) * 100;
  return Math.round((avgMin + avgMax) / 2);
});

// Success Rate Color
const successRateColor = computed(() => {
  const rate = successRate.value;
  if (rate >= 80) return "text-green-500";
  if (rate >= 50) return "text-yellow-500";
  return "text-red-500";
});

// Fetch Breakthrough Data
const fetchBreakthroughData = async () => {
  if (props.breakthroughData) {
    localBreakthroughData.value = props.breakthroughData;
    return;
  }

  loading.value = true;
  phase.value = "prepare";
  try {
    const res = await api.get(
      `/realm-levels/character/${props.characterId}/next`
    );
    localBreakthroughData.value = res.data;
  } catch (e) {
    console.error("Error fetching breakthrough data:", e);
    resultSuccess.value = false;
    resultMessage.value = "Không thể lấy thông tin đột phá. Vui lòng thử lại.";
    phase.value = "result";
  } finally {
    loading.value = false;
  }
};

// Start Breakthrough
const startBreakthrough = async () => {
  // Switch to channeling phase
  phase.value = "channeling";
  channelingProgress.value = 0;

  // Channeling phase steps (3 seconds total)
  const steps = [
    {
      progress: 20,
      text: "Đang vận khí...",
      subtext: "Hội tụ linh khí trong kinh mạch",
    },
    {
      progress: 45,
      text: "Xung phá bình cảnh...",
      subtext: "Vận chuyển chu thiên",
    },
    {
      progress: 70,
      text: "Tâm ma xuất hiện...",
      subtext: "Đối diện với nội tâm",
    },
    {
      progress: 90,
      text: "Ngưng tụ chân khí...",
      subtext: "Hợp nhất linh hồn",
    },
    { progress: 100, text: "Hoàn thành...", subtext: "Chờ kết quả" },
  ];

  // Animate progress bar and text changes
  for (const step of steps) {
    await new Promise((resolve) => setTimeout(resolve, 600)); // 600ms per step = 3s total
    channelingProgress.value = step.progress;
    channelingText.value = step.text;
    channelingSubtext.value = step.subtext;
  }

  // Call actual API
  try {
    // Save old level before breakthrough
    const oldLevel = localBreakthroughData.value?.character?.realm_level || 0;
    const targetLevel =
      localBreakthroughData.value?.nextLevel?.level || oldLevel + 1;

    const res = await api.post(
      `/realm-levels/character/${props.characterId}/breakthrough`
    );

    // Success
    resultSuccess.value = true;
    const successMessage =
      "Chúc mừng đạo hữu! Đạo tâm kiên định, tu vi đại tiến, cảnh giới đã được nâng cao!";
    resultMessage.value = successMessage;

    // Get new level from response
    const newLevel = res.data?.realm_level || targetLevel;

    // Update breakthrough data with new level
    if (res.data) {
      await fetchBreakthroughData();
    }

    // Create success log
    try {
      await api.post("/status-logs", {
        character_id: props.characterId,
        type: "Tu Vi",
        message: `Đột phá thành công từ cấp ${oldLevel} lên cấp ${newLevel}! Tu vi đại tiến, cảnh giới được nâng cao.`,
      });
    } catch (logError) {
      console.error("Error creating success log:", logError);
      // Don't fail the breakthrough if log creation fails
    }

    emit("breakthrough-success");
  } catch (err: any) {
    // Failure
    resultSuccess.value = false;
    const failureMessage =
      err.response?.data?.message ||
      "Tâm cảnh bất ổn, đột phá thất bại. Kinh mạch bị tổn thương, cần tu dưỡng lại.";
    resultMessage.value = failureMessage;

    // Create failure log
    try {
      const currentLevel =
        localBreakthroughData.value?.character?.realm_level || 0;
      const targetLevel =
        localBreakthroughData.value?.nextLevel?.level || currentLevel + 1;
      await api.post("/status-logs", {
        character_id: props.characterId,
        type: "Tu Vi",
        message: `Đột phá thất bại khi cố gắng lên cấp ${targetLevel}. Tâm cảnh bất ổn, kinh mạch bị tổn thương. Cần tu dưỡng lại trước khi thử lại.`,
      });
    } catch (logError) {
      console.error("Error creating failure log:", logError);
      // Don't fail the error handling if log creation fails
    }
  } finally {
    // Switch to result phase
    phase.value = "result";
  }
};

// Handle Close
const handleClose = () => {
  if (phase.value === "channeling") return; // Prevent closing during channeling
  emit("close");
  // Reset state after close animation
  setTimeout(() => {
    phase.value = "prepare";
    resultSuccess.value = false;
    channelingProgress.value = 0;
  }, 300);
};

// Watch for show prop changes
watch(
  () => props.show,
  (val) => {
    if (val) {
      fetchBreakthroughData();
    }
  }
);

// Watch for breakthroughData prop changes
watch(
  () => props.breakthroughData,
  (val) => {
    if (val) {
      localBreakthroughData.value = val;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
/* Spinner Animations */
.animate-spin-slow {
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Zoom In Animations */
.animate-zoom-in-gold {
  animation: zoomInGold 0.5s ease-out forwards;
}

.animate-zoom-in-red {
  animation: zoomInRed 0.5s ease-out forwards;
}

@keyframes zoomInGold {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes zoomInRed {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Vue Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
