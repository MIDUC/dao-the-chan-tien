<template>
  <div
    class="flex items-center justify-between mt-4 pt-4 border-t border-gray-700"
  >
    <div class="text-sm text-gray-400">
      Hiển thị {{ startItem }} - {{ endItem }} trong tổng số {{ total }} mục
    </div>
    <div class="flex items-center gap-2">
      <button
        @click="$emit('page-change', currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
      >
        ← Trước
      </button>

      <div class="flex gap-1">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="$emit('page-change', page)"
          :class="[
            'px-3 py-1 rounded transition-colors',
            page === currentPage
              ? 'bg-gray-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="$emit('page-change', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
      >
        Sau →
      </button>
    </div>

    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-400">Số mục/trang:</span>
      <select
        :value="pageSize"
        @change="
          $emit('page-size-change', +($event.target as HTMLSelectElement).value)
        "
        class="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-gray-500"
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
}>();

defineEmits<{
  "page-change": [page: number];
  "page-size-change": [pageSize: number];
}>();

const startItem = computed(() => {
  return props.total === 0 ? 0 : (props.currentPage - 1) * props.pageSize + 1;
});

const endItem = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.total);
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;

  // Nếu không có trang nào, trả về mảng rỗng
  if (props.totalPages <= 0) {
    return pages;
  }

  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(props.totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});
</script>
