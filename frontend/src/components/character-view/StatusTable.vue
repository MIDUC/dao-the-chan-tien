<template>
  <div class="status-table bg-gray-900/50 rounded border border-gray-700/50 p-0.5">
    <!-- Filters -->
    <div class="flex gap-0.5 mb-0.5 flex-wrap overflow-x-auto scrollbar-hide">
      <button
        v-for="filter in logFilters"
        :key="filter.id"
        class="px-1.5 py-0.5 rounded text-[10px] transition-all whitespace-nowrap flex-shrink-0"
        :class="
          activeLogFilter === filter.id
            ? 'bg-green-500/30 text-green-300 border border-green-500/50'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        "
        @click="handleFilterChange(filter.id)"
      >
        {{ filter.label }} ({{ filter.count }})
      </button>
    </div>

    <!-- Status Logs Table -->
    <div class="overflow-x-auto max-h-[300px] overflow-y-auto">
      <table class="w-full text-[10px]">
        <thead class="sticky top-0 bg-gray-900/95 z-10">
          <tr class="border-b border-gray-700/50">
            <th class="text-left p-1 text-gray-400 font-semibold">Loại</th>
            <th class="text-left p-1 text-gray-400 font-semibold">Nội dung</th>
            <th class="text-left p-1 text-gray-400 font-semibold">Thời gian</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(log, index) in filteredLogs"
            :key="index"
            class="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
          >
            <td class="p-1">
              <span
                class="font-semibold px-1 py-0.5 rounded"
                :class="getLogTypeClass(log.type)"
              >
                {{ log.type }}
              </span>
            </td>
            <td class="p-1 text-gray-300">{{ log.message }}</td>
            <td class="p-1 text-gray-400">
              {{ formatTime(log.created_at || log.timestamp) }}
            </td>
          </tr>
          <tr v-if="filteredLogs.length === 0">
            <td colspan="3" class="p-2 text-center text-gray-500">
              Không có log nào
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { api } from "../../composables/useApi";

interface LogFilter {
  id: string;
  label: string;
  count: number;
}

interface StatusLog {
  id: number;
  type: string;
  message: string;
  created_at?: string;
  timestamp?: Date;
  character_id?: number;
  party_id?: number;
  guild_id?: number;
}

const props = defineProps<{
  characterId?: number;
}>();

const activeLogFilter = ref("all");
const logs = ref<StatusLog[]>([]);
const loading = ref(false);

const logFilters: LogFilter[] = [
  { id: "all", label: "Tất cả", count: 0 },
  { id: "the-su", label: "Thế Sự", count: 0 },
  { id: "tu-vi", label: "Tu Vi", count: 0 },
  { id: "thu-hoach", label: "Thu Hoạch", count: 0 },
  { id: "hoi-phuc", label: "Hồi Phục", count: 0 },
];

const filteredLogs = computed(() => {
  let result = logs.value;
  if (activeLogFilter.value !== "all") {
    const filterMap: Record<string, string> = {
      "the-su": "Thế Sự",
      "tu-vi": "Tu Vi",
      "thu-hoach": "Thu Hoạch",
      "hoi-phuc": "Hồi Phục",
    };
    result = result.filter(
      (log) => log.type === filterMap[activeLogFilter.value]
    );
  }
  return result;
});

const handleFilterChange = (filterId: string) => {
  activeLogFilter.value = filterId;
};

const fetchStatusLogs = async () => {
  if (!props.characterId) return;
  loading.value = true;
  try {
    const response = await api.get(`/status-logs/character/${props.characterId}`);
    logs.value = response.data || [];
    updateFilterCounts();
  } catch (error) {
    console.error("Error fetching status logs:", error);
    logs.value = [];
  } finally {
    loading.value = false;
  }
};

const updateFilterCounts = () => {
  logFilters.forEach((filter) => {
    if (filter.id === "all") {
      filter.count = logs.value.length;
    } else {
      const filterMap: Record<string, string> = {
        "the-su": "Thế Sự",
        "tu-vi": "Tu Vi",
        "thu-hoach": "Thu Hoạch",
        "hoi-phuc": "Hồi Phục",
      };
      filter.count = logs.value.filter(
        (log) => log.type === filterMap[filter.id]
      ).length;
    }
  });
};

const getLogTypeClass = (type: string) => {
  const classes: Record<string, string> = {
    "Thế Sự": "bg-blue-500/20 text-blue-400 border border-blue-500/50",
    "Tu Vi": "bg-purple-500/20 text-purple-400 border border-purple-500/50",
    "Thu Hoạch": "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50",
    "Hồi Phục": "bg-green-500/20 text-green-400 border border-green-500/50",
  };
  return classes[type] || "bg-gray-500/20 text-gray-400 border border-gray-500/50";
};

const formatTime = (time: string | Date | undefined) => {
  if (!time) return "-";
  const date = typeof time === "string" ? new Date(time) : time;
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};

onMounted(() => {
  fetchStatusLogs();
  // Refresh every 30 seconds
  const interval = setInterval(fetchStatusLogs, 30000);
  return () => clearInterval(interval);
});

defineExpose({
  refresh: fetchStatusLogs,
});
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Custom scrollbar for the table container */
.max-h-\[300px\] {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.max-h-\[300px\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[300px\]::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-\[300px\]::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.max-h-\[300px\]::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}
</style>

