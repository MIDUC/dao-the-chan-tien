<template>
  <div class="w-full">
    <AdminTabs :tabs="tabs" :current-tab="currentTab" @tab-selected="currentTab = $event" />

    <div v-if="loading" class="text-gray-400 animate-pulse text-center py-8">
      Đang tải...
    </div>

    <!-- Users Management -->
    <UsersTab
      v-else-if="currentTab === 'users'"
      :users="users"
      @edit-user="editUser"
      @delete-user="deleteUser"
    />

    <!-- Items Management -->
    <ItemsTab
      v-else-if="currentTab === 'items'"
      :items="items"
      @edit-item="editItem"
      @delete-item="deleteItem"
      @create-item="createItem"
      @update-item="updateItem"
    />

    <!-- NPCs Management -->
    <NPCsTab
      v-else-if="currentTab === 'npcs'"
      :npcs="npcs"
      @edit-npc="editNPC"
      @delete-npc="deleteNPC"
      @create-npc="createNPC"
      @update-npc="updateNPC"
    />

    <!-- Quests Management -->
    <QuestsTab
      v-else-if="currentTab === 'quests'"
      :quests="quests"
      :npcs="npcs"
      @edit-quest="editQuest"
      @delete-quest="deleteQuest"
      @create-quest="createQuest"
      @update-quest="updateQuest"
    />

    <!-- Roles Management -->
    <RolesTab
      v-else-if="currentTab === 'roles'"
      :roles="roles"
      @edit-role="editRole"
      @delete-role="deleteRole"
    />

    <!-- System Config Management -->
    <ConfigsTab
      v-else-if="currentTab === 'configs'"
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
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useApi } from "../composables/useApi";
import AdminTabs from "./admin-panel/AdminTabs.vue";
import UsersTab from "./admin-panel/UsersTab.vue";
import ItemsTab from "./admin-panel/ItemsTab.vue";
import NPCsTab from "./admin-panel/NPCsTab.vue";
import QuestsTab from "./admin-panel/QuestsTab.vue";
import RolesTab from "./admin-panel/RolesTab.vue";
import ConfigsTab from "./admin-panel/ConfigsTab.vue";

const { get, put, post, delete: del } = useApi();

const tabs = [
  { id: "users", label: "Users" },
  { id: "items", label: "Items" },
  { id: "npcs", label: "NPCs" },
  { id: "quests", label: "Quests" },
  { id: "roles", label: "Roles" },
  { id: "configs", label: "System Config" },
];

const currentTab = ref("users");
const users = ref<any[]>([]);
const items = ref<any[]>([]);
const npcs = ref<any[]>([]);
const quests = ref<any[]>([]);
const roles = ref<any[]>([]);
const systemConfigs = ref<any[]>([]);
const loading = ref(true);
const editingConfig = ref<any>(null);

const fetchUsers = async () => {
  try {
    const data = await get("/admin/users");
    users.value = Array.isArray(data) ? data : [];
    console.log("Fetched users:", users.value);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    users.value = [];
    if (error.response?.status === 401 || error.response?.status === 403) {
      alert(
        "Bạn không có quyền truy cập. Vui lòng đăng nhập lại với tài khoản admin."
      );
    } else {
      console.error("Error details:", error.response?.data || error.message);
    }
  }
};

const fetchItems = async () => {
  try {
    const data = await get("/admin/items");
    items.value = Array.isArray(data) ? data : [];
    console.log("Fetched items:", items.value);
  } catch (error: any) {
    console.error("Error fetching items:", error);
    items.value = [];
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error("Unauthorized access to admin items");
    }
  }
};

const fetchNPCs = async () => {
  try {
    const data = await get("/admin/npcs");
    npcs.value = Array.isArray(data) ? data : [];
    console.log("Fetched NPCs:", npcs.value);
  } catch (error: any) {
    console.error("Error fetching NPCs:", error);
    npcs.value = [];
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error("Unauthorized access to admin NPCs");
    }
  }
};

const fetchQuests = async () => {
  try {
    const data = await get("/admin/quests");
    quests.value = Array.isArray(data) ? data : [];
    console.log("Fetched quests:", quests.value);
  } catch (error: any) {
    console.error("Error fetching quests:", error);
    quests.value = [];
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error("Unauthorized access to admin quests");
    }
  }
};

const fetchRoles = async () => {
  try {
    const data = await get("/admin/roles");
    roles.value = Array.isArray(data) ? data : [];
    console.log("Fetched roles:", roles.value);
  } catch (error: any) {
    console.error("Error fetching roles:", error);
    roles.value = [];
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error("Unauthorized access to admin roles");
    }
  }
};

const fetchSystemConfigs = async () => {
  try {
    loading.value = true;
    console.log("Fetching system configs from /admin/system-configs...");
    const data = await get("/admin/system-configs");
    console.log("Raw API response:", data);
    systemConfigs.value = Array.isArray(data) ? data : [];
    console.log("Fetched system configs:", systemConfigs.value);
    console.log("Number of configs:", systemConfigs.value.length);
    if (systemConfigs.value.length === 0) {
      console.warn(
        "No configs found. Make sure to run: cd backend && npm run seed"
      );
    }
  } catch (error: any) {
    console.error("Error fetching system configs:", error);
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error response:", error.response);
    console.error("Error response status:", error.response?.status);
    console.error("Error response data:", error.response?.data);
    console.error(
      "Token:",
      localStorage.getItem("token") ? "Present" : "Missing"
    );

    systemConfigs.value = [];

    // Check if it's a network error
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      alert(
        "Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không (http://localhost:3000)"
      );
      return;
    }

    // Check authentication/authorization errors
    if (error.response?.status === 401) {
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    if (error.response?.status === 403) {
      alert(
        "Bạn không có quyền truy cập. Vui lòng đăng nhập lại với tài khoản admin."
      );
      return;
    }

    // Check if route doesn't exist (404)
    if (error.response?.status === 404) {
      alert(
        "Route không tồn tại. Vui lòng kiểm tra:\n" +
          "1. Backend đã restart sau khi thêm route?\n" +
          "2. Route có được đăng ký đúng không?\n" +
          "3. Kiểm tra console log của backend khi start"
      );
      return;
    }

    // Other errors
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Unknown error";
    alert("Lỗi khi tải configs: " + errorMessage);
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
    // Show success message without alert (optional: can add toast notification later)
    console.log("Cập nhật config thành công!");
  } catch (error: any) {
    console.error("Error updating system config:", error);
    alert(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Có lỗi xảy ra khi cập nhật config"
    );
  } finally {
    loading.value = false;
  }
};

// Watch tab changes to load data
watch(
  currentTab,
  async (newTab) => {
    console.log("Tab changed to:", newTab);
    if (newTab === "npcs" && npcs.value.length === 0) {
      await fetchNPCs();
    } else if (newTab === "quests" && quests.value.length === 0) {
      await fetchQuests();
    } else if (newTab === "roles" && roles.value.length === 0) {
      await fetchRoles();
    } else if (newTab === "configs") {
      // Always fetch configs when switching to configs tab
      console.log("Loading configs tab...");
      await fetchSystemConfigs();
    }
  },
  { immediate: false }
);

const deleteUser = async (id: number) => {
  if (!confirm("Bạn chắc chắn muốn xóa user này?")) return;
  try {
    await del(`/admin/users/${id}`);
    await fetchUsers();
  } catch (error: any) {
    console.error("Error deleting user:", error);
    alert(
      "Lỗi khi xóa user: " + (error.response?.data?.message || error.message)
    );
  }
};

const deleteItem = async (id: number) => {
  if (!confirm("Bạn chắc chắn muốn xóa item này?")) return;
  try {
    await del(`/admin/items/${id}`);
    await fetchItems();
  } catch (error: any) {
    console.error("Error deleting item:", error);
    alert(
      "Lỗi khi xóa item: " + (error.response?.data?.message || error.message)
    );
  }
};

const deleteNPC = async (id: number) => {
  if (!confirm("Bạn chắc chắn muốn xóa NPC này?")) return;
  try {
    await del(`/admin/npcs/${id}`);
    await fetchNPCs();
  } catch (error: any) {
    console.error("Error deleting NPC:", error);
    alert(
      "Lỗi khi xóa NPC: " + (error.response?.data?.message || error.message)
    );
  }
};

const deleteQuest = async (id: number) => {
  if (!confirm("Bạn chắc chắn muốn xóa quest này?")) return;
  try {
    await del(`/admin/quests/${id}`);
    await fetchQuests();
  } catch (error: any) {
    console.error("Error deleting quest:", error);
    alert(
      "Lỗi khi xóa quest: " + (error.response?.data?.message || error.message)
    );
  }
};

const deleteRole = async (id: number) => {
  if (!confirm("Bạn chắc chắn muốn xóa role này?")) return;
  try {
    await del(`/admin/roles/${id}`);
    await fetchRoles();
  } catch (error: any) {
    console.error("Error deleting role:", error);
    alert(
      "Lỗi khi xóa role: " + (error.response?.data?.message || error.message)
    );
  }
};

const editUser = (user: any) => {
  // TODO: Implement edit modal
  console.log("Edit user:", user);
  alert("Tính năng sửa user đang được phát triển");
};

const editItem = (item: any) => {
  console.log("Edit item:", item);
  // Handled by ItemsTab component
};

const createItem = async (data: any) => {
  try {
    loading.value = true;
    await post("/admin/items", data);
    await fetchItems();
    console.log("Item created successfully");
  } catch (error: any) {
    console.error("Error creating item:", error);
    alert(
      "Lỗi khi tạo item: " + (error.response?.data?.message || error.message)
    );
  } finally {
    loading.value = false;
  }
};

const updateItem = async (id: number, data: any) => {
  try {
    loading.value = true;
    await put(`/admin/items/${id}`, data);
    await fetchItems();
    console.log("Item updated successfully");
  } catch (error: any) {
    console.error("Error updating item:", error);
    alert(
      "Lỗi khi cập nhật item: " + (error.response?.data?.message || error.message)
    );
  } finally {
    loading.value = false;
  }
};

const editNPC = (npc: any) => {
  console.log("Edit NPC:", npc);
  // Handled by NPCsTab component
};

const createNPC = async (data: any) => {
  try {
    loading.value = true;
    await post("/admin/npcs", data);
    await fetchNPCs();
    console.log("NPC created successfully");
  } catch (error: any) {
    console.error("Error creating NPC:", error);
    alert(
      "Lỗi khi tạo NPC: " + (error.response?.data?.message || error.message)
    );
  } finally {
    loading.value = false;
  }
};

const updateNPC = async (id: number, data: any) => {
  try {
    loading.value = true;
    await put(`/admin/npcs/${id}`, data);
    await fetchNPCs();
    console.log("NPC updated successfully");
  } catch (error: any) {
    console.error("Error updating NPC:", error);
    alert(
      "Lỗi khi cập nhật NPC: " + (error.response?.data?.message || error.message)
    );
  } finally {
    loading.value = false;
  }
};

const editQuest = (quest: any) => {
  console.log("Edit quest:", quest);
  // Handled by QuestsTab component
};

const createQuest = async (data: any) => {
  try {
    loading.value = true;
    await post("/admin/quests", data);
    await fetchQuests();
    console.log("Quest created successfully");
  } catch (error: any) {
    console.error("Error creating quest:", error);
    alert(
      "Lỗi khi tạo quest: " + (error.response?.data?.message || error.message)
    );
  } finally {
    loading.value = false;
  }
};

const updateQuest = async (id: number, data: any) => {
  try {
    loading.value = true;
    await put(`/admin/quests/${id}`, data);
    await fetchQuests();
    console.log("Quest updated successfully");
  } catch (error: any) {
    console.error("Error updating quest:", error);
    alert(
      "Lỗi khi cập nhật quest: " + (error.response?.data?.message || error.message)
    );
  } finally {
    loading.value = false;
  }
};

const editRole = (role: any) => {
  console.log("Edit role:", role);
  alert("Tính năng sửa role đang được phát triển");
};

onMounted(async () => {
  try {
    await Promise.all([fetchUsers(), fetchItems()]);
  } catch (error) {
    console.error("Error loading initial data:", error);
  } finally {
    loading.value = false;
  }
});
</script>
