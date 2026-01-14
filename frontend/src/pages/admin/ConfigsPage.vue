<template>
  <div class="space-y-4">
    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-purple-500/20 p-6">
      <h2 class="text-2xl font-bold text-purple-400 mb-6">⚙️ System Configs</h2>
      <ConfigsTab
        :system-configs="systemConfigs"
        :editing-config="editingConfig"
        @start-edit="startEditConfig"
        @update-editing-value="(val) => { if (editingConfig) editingConfig.value = val; }"
        @update-editing-description="(val) => { if (editingConfig) editingConfig.description = val; }"
        @update-editing-active="(val) => { if (editingConfig) editingConfig.is_active = val; }"
        @save-config="saveSystemConfig"
        @cancel-edit="cancelEditConfig"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '../../composables/useApi';
import ConfigsTab from '../../components/admin-panel/ConfigsTab.vue';

const { get, put } = useApi();

const systemConfigs = ref<any[]>([]);
const editingConfig = ref<any>(null);
const loading = ref(false);

const fetchSystemConfigs = async () => {
  try {
    loading.value = true;
    const data = await get('/admin/system-configs');
    systemConfigs.value = Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('Error fetching system configs:', error);
    systemConfigs.value = [];
  } finally {
    loading.value = false;
  }
};

const startEditConfig = (config: any) => {
  editingConfig.value = { ...config };
};

const cancelEditConfig = () => {
  editingConfig.value = null;
};

const saveSystemConfig = async () => {
  if (!editingConfig.value) return;
  try {
    loading.value = true;
    await put(`/admin/system-configs/${editingConfig.value.key}`, {
      value: editingConfig.value.value,
      description: editingConfig.value.description,
      is_active: editingConfig.value.is_active,
    });
    editingConfig.value = null;
    await fetchSystemConfigs();
  } catch (error: any) {
    console.error('Error updating system config:', error);
    alert('Lỗi khi cập nhật config: ' + (error.response?.data?.message || error.message));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSystemConfigs();
});
</script>

