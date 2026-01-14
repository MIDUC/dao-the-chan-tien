<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      @click.self="handleClose"
    >
      <div
        class="relative w-full max-w-xs mx-4 overflow-hidden rounded-xl border border-transparent bg-[#121212] shadow-2xl shadow-purple-900/20"
      >
        <div
          class="absolute inset-0 bg-[url('/img/noise.png')] opacity-10 pointer-events-none"
        ></div>
        <div
          class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"
        ></div>

        <div
          class="relative flex items-center justify-between px-4 py-3 border-b border-transparent"
        >
          <h2
            class="text-lg font-thu-phap font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 text-glow-yellow-gradient"
          >
            Đột Phá Cảnh Giới
          </h2>
        </div>

        <div class="p-3 relative min-h-[350px] flex flex-col">
          <div v-if="phase === 'prepare' && breakthroughData" class="space-y-4">
            <div class="flex justify-between items-center">
              <div class="text-center w-1/2 border-r border-transparent pr-2">
                <div class="text-[10px] text-gray-400 uppercase tracking-wider">
                  Hiện tại
                </div>
                <div class="font-bold text-gray-300 text-xs">
                  {{
                    breakthroughData?.character?.realm_level
                      ? formatRealm(breakthroughData.character.realm_level)
                      : "N/A"
                  }}
                </div>
              </div>
              <div class="flex flex-col items-center justify-center px-2">
                <span class="text-yellow-500 text-lg">➜</span>
              </div>
              <div class="text-center w-1/2 pl-2">
                <div
                  class="text-[10px] text-yellow-500/80 uppercase tracking-wider"
                >
                  Mục tiêu
                </div>
                <div
                  class="font-bold text-yellow-400 shadow-yellow-500/50 drop-shadow-sm text-xs"
                >
                  {{
                    breakthroughData.nextLevel?.name ||
                    (breakthroughData.nextLevel?.level
                      ? formatRealm(breakthroughData.nextLevel.level)
                      : "N/A")
                  }}
                </div>
              </div>
            </div>

            <!-- Character Display -->
            <div
              class="relative flex flex-col items-center justify-center py-4"
            >
              <!-- Character Image -->
              <div
                class="relative w-full h-[320px] flex items-center justify-center mt-4"
              >
                <div
                  class="relative z-0 h-full flex items-center justify-center"
                >
                  <img
                    :src="characterImage"
                    alt="Character"
                    class="h-full w-auto object-contain filter drop-shadow-2xl opacity-90"
                  />

                  <div
                    class="absolute inset-0 pointer-events-none overflow-hidden"
                  >
                    <div
                      v-for="i in 15"
                      :key="i"
                      class="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
                      :style="{
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                        animationDelay: Math.random() * 2 + 's',
                        opacity: Math.random() * 0.5 + 0.3,
                      }"
                    ></div>
                  </div>
                </div>

                <div
                  class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center"
                >
                  <div
                    class="relative w-24 h-24 flex items-center justify-center"
                  >
                    <svg
                      class="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] pointer-events-none"
                    >
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        stroke="currentColor"
                        stroke-width="3"
                        fill="transparent"
                        class="text-black/40"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        stroke="currentColor"
                        stroke-width="3"
                        fill="transparent"
                        :class="getSuccessColor(currentSuccessRate)"
                        :stroke-dasharray="276"
                        :stroke-dashoffset="
                          276 - (276 * currentSuccessRate) / 100
                        "
                        stroke-linecap="round"
                        class="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    <button
                      @click="startBreakthrough"
                      :disabled="
                        !breakthroughData || !breakthroughData.canBreakthrough
                      "
                      class="absolute inset-1.5 rounded-full flex flex-col items-center justify-center transition-all duration-300 group overflow-hidden"
                      :class="
                        breakthroughData && breakthroughData.canBreakthrough
                          ? 'bg-gray-900/80 backdrop-blur-sm border border-purple-500/50 hover:border-yellow-400 hover:bg-gray-800/90 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                          : 'bg-gray-900/90 border border-gray-700 text-gray-500 cursor-not-allowed'
                      "
                    >
                      <div
                        v-if="
                          breakthroughData && breakthroughData.canBreakthrough
                        "
                        class="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      ></div>

                      <div class="relative z-10 text-center">
                        <div
                          class="text-xl font-bold leading-none"
                          :class="
                            getSuccessColor(currentSuccessRate) +
                            ' ' +
                            (currentSuccessRate >= 80
                              ? 'text-glow-green'
                              : currentSuccessRate >= 50
                              ? 'text-glow-gold-sm'
                              : 'text-glow-red')
                          "
                        >
                          {{ currentSuccessRate }}%
                        </div>

                        <div
                          class="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all"
                          :class="
                            breakthroughData && breakthroughData.canBreakthrough
                              ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-black'
                              : 'border-gray-600 bg-gray-800 text-gray-500'
                          "
                        >
                          {{
                            breakthroughData && breakthroughData.canBreakthrough
                              ? "ĐỘT PHÁ"
                              : "CHƯA ĐỦ"
                          }}
                        </div>
                      </div>

                      <div
                        v-if="
                          breakthroughData && breakthroughData.canBreakthrough
                        "
                        class="absolute inset-0 rounded-full animate-ping opacity-20 bg-purple-500"
                      ></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="breakthroughData && breakthroughData.requirements"
              class="space-y-2"
            >
              <div
                class="text-xs font-thu-phap font-semibold text-gray-400 uppercase"
              >
                Điều kiện cần thiết
              </div>
              <div
                v-if="breakthroughData.requirements.length === 0"
                class="text-sm text-gray-500 italic text-center py-2"
              >
                Tâm cảnh thông suốt, không cần vật phẩm.
              </div>

              <div
                v-for="(req, index) in breakthroughData.requirements"
                :key="index"
                class="flex items-center justify-between p-2 rounded bg-black/20 border"
                :class="
                  breakthroughData.metRequirements &&
                  breakthroughData.metRequirements[index]
                    ? 'border-green-500/30'
                    : 'border-red-500/30'
                "
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-xs"
                  >
                    {{ req.type.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-200">
                      {{ getRequirementLabel(req.type) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      Cần: {{ req.count }}
                    </div>
                  </div>
                </div>
                <div
                  class="text-sm font-bold"
                  :class="
                    breakthroughData.metRequirements &&
                    breakthroughData.metRequirements[index]
                      ? 'text-green-400'
                      : 'text-red-400'
                  "
                >
                  {{
                    breakthroughData.metRequirements &&
                    breakthroughData.metRequirements[index]
                      ? "Đủ"
                      : "Thiếu"
                  }}
                </div>
              </div>
            </div>
          </div>

          <div
            v-else-if="phase === 'breaking'"
            class="flex flex-col items-center justify-center h-full space-y-6 py-10"
          >
            <div class="relative">
              <div
                class="w-24 h-24 rounded-full border-4 border-yellow-500/30 animate-spin-slow"
              ></div>
              <div
                class="absolute inset-0 w-24 h-24 rounded-full border-t-4 border-yellow-400 animate-spin"
              ></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-3xl">🧘</span>
              </div>
            </div>
            <div class="text-center space-y-2">
              <h3
                class="text-xl font-thu-phap font-bold text-yellow-100 animate-pulse text-glow-gold-sm"
              >
                Đang Vận Chuyển Chu Thiên...
              </h3>
              <p class="text-sm text-gray-400">{{ loadingText }}</p>
            </div>
            <div
              class="w-full h-2 bg-gray-800 rounded-full overflow-hidden mt-4"
            >
              <div
                class="h-full bg-yellow-500 transition-all duration-300 ease-out"
                :style="{ width: progress + '%' }"
              ></div>
            </div>
          </div>

          <div
            v-else-if="phase === 'result'"
            class="flex flex-col items-center justify-center h-full text-center animate-zoom-in"
          >
            <div class="mb-4 text-6xl drop-shadow-lg">
              {{ resultSuccess ? "🌟" : "💀" }}
            </div>

            <h3
              class="text-2xl font-thu-phap font-bold mb-2"
              :class="
                resultSuccess
                  ? 'text-yellow-400 text-glow-gold'
                  : 'text-red-500 text-glow-red'
              "
            >
              {{ resultSuccess ? "Đột Phá Thành Công!" : "Đột Phá Thất Bại" }}
            </h3>

            <p class="text-gray-300 mb-6 px-4">
              {{ resultMessage }}
            </p>

            <div
              v-if="resultSuccess"
              class="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6 w-full"
            >
              <div class="text-xs text-yellow-200">Cảnh giới hiện tại</div>
              <div class="text-sm font-bold text-white">
                {{
                  breakthroughData?.nextLevel?.name ||
                  (breakthroughData?.nextLevel?.level
                    ? formatRealm(breakthroughData.nextLevel.level)
                    : "N/A")
                }}
              </div>
            </div>

            <button
              @click="handleClose"
              class="px-8 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white transition-colors"
            >
              Đóng
            </button>
          </div>

          <div
            v-if="loading"
            class="absolute inset-0 flex items-center justify-center bg-[#121212] z-10"
          >
            <div class="text-yellow-500">Đang lấy dữ liệu...</div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { api } from "../../composables/useApi";
import { formatRealm } from "../../utils/realm";
import characterImageSrc from "../../assets/nhanvatngoithien1-removebg-preview.png";

const characterImage = characterImageSrc;

// Định nghĩa Props & Emits
const props = defineProps<{
  show: boolean;
  characterId: number;
}>();

const emit = defineEmits(["close", "breakthrough-success"]);

// State quản lý luồng
type Phase = "prepare" | "breaking" | "result";
const phase = ref<Phase>("prepare");
const loading = ref(false);
const progress = ref(0); // Cho thanh loading ảo
const loadingText = ref("Hấp thu linh khí...");

// Data kết quả
const resultSuccess = ref(false);
const resultMessage = ref("");
const breakthroughData = ref<any>(null); // Giữ nguyên type của bạn

// Helper hiển thị màu sắc dựa trên tỷ lệ thành công
const currentSuccessRate = computed(() => {
  if (!breakthroughData.value?.requirements) return 0;
  // Giả sử lấy min success rate của yêu cầu đầu tiên hoặc logic tính trung bình của bạn
  // Ở đây tôi mock tạm để hiện UI, bạn thay bằng logic thực tế của game
  const reqs = breakthroughData.value.requirements;
  if (reqs.length === 0) return 100;

  // Logic mẫu: Lấy rate của item khó nhất
  return Math.round((reqs[0].success_rate?.min || 0.5) * 100);
});

const getSuccessColor = (rate: number) => {
  if (rate >= 80) return "text-green-500";
  if (rate >= 50) return "text-yellow-500";
  return "text-red-500";
};

const getRequirementLabel = (type: string) => {
  const map: Record<string, string> = {
    linh_thach: "Linh Thạch",
    don_duoc: "Đan Dược Hỗ Trợ",
    tam_ma: "Trảm Tâm Ma",
    exp: "Tu Vi Tích Lũy",
  };
  return map[type] || type;
};

// --- LOGIC CHÍNH ---

const fetchBreakthroughData = async () => {
  loading.value = true;
  phase.value = "prepare";
  try {
    const res = await api.get(
      `/realm-levels/character/${props.characterId}/next`
    );
    breakthroughData.value = res.data;
  } catch (e) {
    console.error(e);
    // Xử lý lỗi...
  } finally {
    loading.value = false;
  }
};

const startBreakthrough = async () => {
  // 1. Chuyển sang màn hình "Breaking"
  phase.value = "breaking";
  progress.value = 0;

  // 2. Chạy animation giả lập (cho người chơi hồi hộp)
  const steps = [
    { p: 20, t: "Hội tụ kinh mạch..." },
    { p: 50, t: "Xung phá bình cảnh..." },
    { p: 80, t: "Đối mặt tâm ma..." },
    { p: 100, t: "Ngưng tụ..." },
  ];

  for (const step of steps) {
    await new Promise((r) => setTimeout(r, 600)); // Delay mỗi bước
    progress.value = step.p;
    loadingText.value = step.t;
  }

  // 3. Gọi API thật
  try {
    // Lưu old level trước khi đột phá
    const oldLevel = breakthroughData.value?.character?.realm_level || 0;
    const targetLevel =
      breakthroughData.value?.nextLevel?.level || oldLevel + 1;

    // Lưu ý: API nên trả về kết quả success: boolean và message
    const res = await api.post(
      `/realm-levels/character/${props.characterId}/breakthrough`
    );

    // Giả sử cấu trúc trả về: { success: boolean, message: string, newLevel: ... }
    resultSuccess.value = true;
    resultMessage.value =
      "Chúc mừng đạo hữu đạo tâm kiên định, tu vi đại tiến!";

    // Lấy level mới từ response
    const newLevel = res.data?.realm_level || targetLevel;

    // Ghi log thành công
    try {
      await api.post("/status-logs", {
        character_id: props.characterId,
        type: "Tu Vi",
        message: `Đột phá thành công từ cấp ${oldLevel} lên cấp ${newLevel}! Tu vi đại tiến, cảnh giới được nâng cao.`,
      });
    } catch (logError) {
      console.error("Error creating success log:", logError);
      // Không fail breakthrough nếu log creation fails
    }

    emit("breakthrough-success");
  } catch (err: any) {
    resultSuccess.value = false;
    resultMessage.value =
      err.response?.data?.message ||
      "Tâm cảnh bất ổn, đột phá thất bại, bị tổn thương kinh mạch!";

    // Ghi log thất bại
    try {
      const currentLevel = breakthroughData.value?.character?.realm_level || 0;
      const targetLevel =
        breakthroughData.value?.nextLevel?.level || currentLevel + 1;
      await api.post("/status-logs", {
        character_id: props.characterId,
        type: "Tu Vi",
        message: `Đột phá thất bại khi cố gắng lên cấp ${targetLevel}. Tâm cảnh bất ổn, kinh mạch bị tổn thương. Cần tu dưỡng lại trước khi thử lại.`,
      });
    } catch (logError) {
      console.error("Error creating failure log:", logError);
      // Không fail error handling nếu log creation fails
    }
  } finally {
    // 4. Chuyển sang màn hình kết quả
    phase.value = "result";
  }
};

const handleClose = () => {
  if (phase.value === "breaking") return; // Không cho đóng khi đang chạy
  emit("close");
  // Reset state sau khi animation đóng hoàn tất (nếu cần)
  setTimeout(() => {
    phase.value = "prepare";
    resultSuccess.value = false;
  }, 300);
};

watch(
  () => props.show,
  (val) => {
    if (val) fetchBreakthroughData();
  }
);
</script>

<style scoped>
/* Utility Animations */
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
.animate-zoom-in {
  animation: zoomIn 0.3s ease-out forwards;
}
@keyframes zoomIn {
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
