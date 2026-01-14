<template>
  <div class="space-y-4">
    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-purple-500/20 p-6">
      <h2 class="text-2xl font-bold text-purple-400 mb-6">👥 Quản lý Users</h2>
      <UsersTab
        :users="users"
        @edit-user="editUser"
        @delete-user="deleteUser"
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
import UsersTab from '../../components/admin-panel/UsersTab.vue';
import Pagination from '../../components/admin-panel/Pagination.vue';

const { get, delete: del } = useApi();

const users = ref<any[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const totalPages = ref(0);

const fetchUsers = async () => {
  try {
    const data = await get(`/admin/users?page=${currentPage.value}&pageSize=${pageSize.value}`);
    if (data && typeof data === 'object' && 'data' in data) {
      users.value = Array.isArray(data.data) ? data.data : [];
      total.value = data.total || 0;
      totalPages.value = data.totalPages || 0;
      currentPage.value = data.page || 1;
    } else {
      // Fallback for old API format
      users.value = Array.isArray(data) ? data : [];
      total.value = users.value.length;
      totalPages.value = 1;
    }
  } catch (error: any) {
    console.error('Error fetching users:', error);
    users.value = [];
    if (error.response?.status === 401 || error.response?.status === 403) {
      alert('Bạn không có quyền truy cập. Vui lòng đăng nhập lại với tài khoản admin.');
    }
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchUsers();
};

const handlePageSizeChange = (newPageSize: number) => {
  pageSize.value = newPageSize;
  currentPage.value = 1;
  fetchUsers();
};

const deleteUser = async (id: number) => {
  if (!confirm('Bạn chắc chắn muốn xóa user này?')) return;
  try {
    await del(`/admin/users/${id}`);
    await fetchUsers();
  } catch (error: any) {
    console.error('Error deleting user:', error);
    alert('Lỗi khi xóa user: ' + (error.response?.data?.message || error.message));
  }
};

const editUser = (user: any) => {
  console.log('Edit user:', user);
  alert('Tính năng sửa user đang được phát triển');
};

onMounted(() => {
  fetchUsers();
});
</script>

