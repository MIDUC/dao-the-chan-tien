<template>
  <div class="space-y-4">
    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-purple-500/20 p-6">
      <h2 class="text-2xl font-bold text-purple-400 mb-6">📜 Quản lý Quests</h2>
      <QuestsTab
        :quests="quests"
        :npcs="npcs"
        @edit-quest="editQuest"
        @delete-quest="deleteQuest"
        @create-quest="createQuest"
        @update-quest="updateQuest"
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
import QuestsTab from '../../components/admin-panel/QuestsTab.vue';
import Pagination from '../../components/admin-panel/Pagination.vue';

const { get, post, put, delete: del } = useApi();

const quests = ref<any[]>([]);
const npcs = ref<any[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const totalPages = ref(0);

const fetchQuests = async () => {
  try {
    const data = await get(`/admin/quests?page=${currentPage.value}&pageSize=${pageSize.value}`);
    if (data && typeof data === 'object' && 'data' in data) {
      quests.value = Array.isArray(data.data) ? data.data : [];
      total.value = data.total || 0;
      totalPages.value = data.totalPages || 0;
      currentPage.value = data.page || 1;
    } else {
      quests.value = Array.isArray(data) ? data : [];
      total.value = quests.value.length;
      totalPages.value = 1;
    }
  } catch (error: any) {
    console.error('Error fetching quests:', error);
    quests.value = [];
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchQuests();
};

const handlePageSizeChange = (newPageSize: number) => {
  pageSize.value = newPageSize;
  currentPage.value = 1;
  fetchQuests();
};

const fetchNPCs = async () => {
  try {
    const data = await get('/admin/npcs');
    npcs.value = Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Error fetching NPCs:', error);
    npcs.value = [];
  }
};

const createQuest = async (data: any) => {
  try {
    loading.value = true;
    await post('/admin/quests', data);
    await fetchQuests();
  } catch (error: any) {
    console.error('Error creating quest:', error);
    alert('Lỗi khi tạo quest: ' + (error.response?.data?.message || error.message));
  } finally {
    loading.value = false;
  }
};

const updateQuest = async (id: number, data: any) => {
  try {
    loading.value = true;
    await put(`/admin/quests/${id}`, data);
    await fetchQuests();
  } catch (error: any) {
    console.error('Error updating quest:', error);
    alert('Lỗi khi cập nhật quest: ' + (error.response?.data?.message || error.message));
  } finally {
    loading.value = false;
  }
};

const deleteQuest = async (id: number) => {
  if (!confirm('Bạn chắc chắn muốn xóa quest này?')) return;
  try {
    await del(`/admin/quests/${id}`);
    await fetchQuests();
  } catch (error: any) {
    console.error('Error deleting quest:', error);
    alert('Lỗi khi xóa quest: ' + (error.response?.data?.message || error.message));
  }
};

const editQuest = (quest: any) => {
  console.log('Edit quest:', quest);
  // Handled by QuestsTab component
};

onMounted(() => {
  fetchQuests();
  fetchNPCs();
});
</script>

