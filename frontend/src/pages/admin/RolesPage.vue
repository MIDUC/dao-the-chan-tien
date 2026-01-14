<template>
  <div class="space-y-4">
    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-purple-500/20 p-6">
      <h2 class="text-2xl font-bold text-purple-400 mb-6">🔐 Quản lý Roles</h2>
      <RolesTab
        :roles="roles"
        @edit-role="editRole"
        @delete-role="deleteRole"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '../../composables/useApi';
import RolesTab from '../../components/admin-panel/RolesTab.vue';

const { get, delete: del } = useApi();

const roles = ref<any[]>([]);

const fetchRoles = async () => {
  try {
    const data = await get('/admin/roles');
    roles.value = Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    roles.value = [];
  }
};

const deleteRole = async (id: number) => {
  if (!confirm('Bạn chắc chắn muốn xóa role này?')) return;
  try {
    await del(`/admin/roles/${id}`);
    await fetchRoles();
  } catch (error: any) {
    console.error('Error deleting role:', error);
    alert('Lỗi khi xóa role: ' + (error.response?.data?.message || error.message));
  }
};

const editRole = (role: any) => {
  console.log('Edit role:', role);
  alert('Tính năng sửa role đang được phát triển');
};

onMounted(() => {
  fetchRoles();
});
</script>

