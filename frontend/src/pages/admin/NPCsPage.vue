<template>
  <div class="space-y-4">
    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-purple-500/20 p-6">
      <h2 class="text-2xl font-bold text-purple-400 mb-6">🧙 Quản lý NPCs</h2>
      <NPCsTab
        :npcs="npcs"
        @edit-npc="editNPC"
        @delete-npc="deleteNPC"
        @create-npc="createNPC"
        @update-npc="updateNPC"
      />
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="total"
        :page-size="pageSize"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '../../composables/useApi';
import NPCsTab from '../../components/admin-panel/NPCsTab.vue';
import Pagination from '../../components/admin-panel/Pagination.vue';

const { get, post, put, delete: del } = useApi();

const npcs = ref<any[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const totalPages = ref(0);

const fetchNPCs = async () => {
  try {
    const data = await get(`/admin/npcs?page=${currentPage.value}&pageSize=${pageSize.value}`);
    if (data && typeof data === 'object' && 'data' in data) {
      npcs.value = Array.isArray(data.data) ? data.data : [];
      total.value = data.total || 0;
      totalPages.value = data.totalPages || 0;
      currentPage.value = data.page || 1;
    } else {
      npcs.value = Array.isArray(data) ? data : [];
      total.value = npcs.value.length;
      totalPages.value = 1;
    }
  } catch (error: any) {
    console.error('Error fetching NPCs:', error);
    npcs.value = [];
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchNPCs();
};

const handlePageSizeChange = (newPageSize: number) => {
  pageSize.value = newPageSize;
  currentPage.value = 1;
  fetchNPCs();
};

const createNPC = async (data: any) => {
  try {
    loading.value = true;
    await post('/admin/npcs', data);
    await fetchNPCs();
  } catch (error: any) {
    console.error('Error creating NPC:', error);
    alert('Lỗi khi tạo NPC: ' + (error.response?.data?.message || error.message));
  } finally {
    loading.value = false;
  }
};

const updateNPC = async (id: number, data: any) => {
  try {
    loading.value = true;
    await put(`/admin/npcs/${id}`, data);
    await fetchNPCs();
  } catch (error: any) {
    console.error('Error updating NPC:', error);
    alert('Lỗi khi cập nhật NPC: ' + (error.response?.data?.message || error.message));
  } finally {
    loading.value = false;
  }
};

const deleteNPC = async (id: number) => {
  if (!confirm('Bạn chắc chắn muốn xóa NPC này?')) return;
  try {
    await del(`/admin/npcs/${id}`);
    await fetchNPCs();
  } catch (error: any) {
    console.error('Error deleting NPC:', error);
    alert('Lỗi khi xóa NPC: ' + (error.response?.data?.message || error.message));
  }
};

const editNPC = (npc: any) => {
  console.log('Edit NPC:', npc);
  // Handled by NPCsTab component
};

onMounted(() => {
  fetchNPCs();
});
</script>

