<template>
  <div class="bg-gray-900/50 rounded border border-gray-700/50 p-0.5">
    <!-- Log Filters -->
    <div
      class="flex gap-0.5 mb-0.5 flex-wrap overflow-x-auto scrollbar-hide"
    >
      <button
        v-for="filter in logFilters"
        :key="filter.id"
        class="px-1.5 py-0.5 rounded text-[10px] transition-all whitespace-nowrap flex-shrink-0"
        :class="
          activeLogFilter === filter.id
            ? 'bg-green-500/30 text-green-300 border border-green-500/50'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        "
        @click="$emit('filter-change', filter.id)"
      >
        {{ filter.label }} ({{ filter.count }})
      </button>
    </div>

    <!-- Log Entries -->
    <div
      class="space-y-1 max-h-40 overflow-y-auto scrollbar-hide"
    >
      <div
        v-for="(log, index) in filteredLogs"
        :key="index"
        class="text-[10px] p-1 rounded bg-gray-800/50 border-l-2"
        :class="getLogBorderColor(log.type)"
      >
        <span class="font-semibold" :class="getLogTextColor(log.type)">
          [{{ log.type }}]
        </span>
        <span class="text-gray-300 ml-1 sm:ml-2 break-words">{{
          log.message
        }}</span>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex justify-end mt-3 sm:mt-4">
      <button class="text-xs text-gray-400 hover:text-gray-300">
        1 Về cuối
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface LogFilter {
  id: string;
  label: string;
  count: number;
}

interface LogEntry {
  type: string;
  message: string;
  timestamp: Date;
}

const props = defineProps<{
  logFilters: LogFilter[];
  logs: LogEntry[];
  activeLogFilter: string;
}>();

defineEmits<{
  "filter-change": [filterId: string];
}>();

const filteredLogs = computed(() => {
  if (props.activeLogFilter === "all") return props.logs;
  const filterMap: Record<string, string> = {
    "the-su": "Thế Sự",
    "tu-vi": "Tu Vi",
    "thu-hoach": "Thu Hoạch",
    "hoi-phuc": "Hồi Phục",
  };
  return props.logs.filter(
    (log) => log.type === filterMap[props.activeLogFilter]
  );
});

const getLogBorderColor = (type: string) => {
  const colors: Record<string, string> = {
    "Thế Sự": "border-blue-500",
    "Tu Vi": "border-purple-500",
    "Thu Hoạch": "border-yellow-500",
    "Hồi Phục": "border-green-500",
  };
  return colors[type] || "border-gray-600";
};

const getLogTextColor = (type: string) => {
  const colors: Record<string, string> = {
    "Thế Sự": "text-blue-400",
    "Tu Vi": "text-purple-400",
    "Thu Hoạch": "text-yellow-400",
    "Hồi Phục": "text-green-400",
  };
  return colors[type] || "text-gray-400";
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
