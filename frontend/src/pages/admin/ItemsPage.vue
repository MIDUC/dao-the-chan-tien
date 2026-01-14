<template>
  <div class="space-y-4">
    <div
      class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-600/20 p-6"
    >
      <h2 class="text-2xl font-bold text-gray-300 mb-6">🎒 Quản lý Items</h2>

      <!-- Search and Filters -->
      <div class="mb-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-1">
              Tìm kiếm
            </label>
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="Tên hoặc mô tả..."
              class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          <!-- Item Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              Loại vật phẩm
            </label>
            <select
              v-model="filterItemType"
              class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
            >
              <option value="">Tất cả</option>
              <option value="consumable">Tiêu hao</option>
              <option value="equipment">Trang bị</option>
              <option value="material">Nguyên liệu</option>
              <option value="quest_item">Vật phẩm nhiệm vụ</option>
              <option value="special">Đặc biệt</option>
            </select>
          </div>

          <!-- Rarity Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              Độ hiếm
            </label>
            <select
              v-model="filterRarity"
              class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
            >
              <option value="">Tất cả</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
              <option value="mythic">Mythic</option>
            </select>
          </div>

          <!-- Search Button -->
          <div class="flex items-end">
            <button
              @click="handleSearch"
              class="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
            >
              🔍 Tìm kiếm
            </button>
          </div>
        </div>

        <!-- Clear Filters Button -->
        <div v-if="hasActiveFilters" class="flex justify-end">
          <button
            @click="clearFilters"
            class="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <ItemsTab
        :items="items"
        :current-page="currentPage"
        :page-size="pageSize"
        @edit-item="editItem"
        @delete-item="deleteItem"
        @create-item="createItem"
        @update-item="updateItem"
      />
      <Pagination
        v-if="totalPages > 0 && total > 0"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="total"
        :page-size="pageSize"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
      <div
        v-else-if="!loading && total === 0"
        class="text-center text-gray-400 py-8"
      >
        Không có dữ liệu
      </div>
      <div v-if="totalPages > 0" class="text-xs text-gray-500 mt-2">
        Debug: total={{ total }}, totalPages={{ totalPages }}, currentPage={{
          currentPage
        }}, pageSize={{ pageSize }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useApi } from "../../composables/useApi";
import ItemsTab from "../../components/admin-panel/ItemsTab.vue";
import Pagination from "../../components/admin-panel/Pagination.vue";

const { get, post, put, delete: del } = useApi();

const items = ref<any[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10); // Default 10 for items management
const total = ref(0);
const totalPages = ref(0);
const searchQuery = ref("");
const filterItemType = ref("");
const filterRarity = ref("");

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value !== "" ||
    filterItemType.value !== "" ||
    filterRarity.value !== ""
  );
});

const buildQueryString = () => {
  const params = new URLSearchParams();
  // Luôn thêm page và pageSize, ngay cả khi là giá trị mặc định
  params.append("page", currentPage.value.toString());
  params.append("pageSize", pageSize.value.toString());
  if (searchQuery.value && searchQuery.value.trim()) {
    params.append("search", searchQuery.value.trim());
  }
  if (
    filterItemType.value &&
    filterItemType.value !== "all" &&
    filterItemType.value !== ""
  ) {
    params.append("itemType", filterItemType.value);
  }
  if (
    filterRarity.value &&
    filterRarity.value !== "all" &&
    filterRarity.value !== ""
  ) {
    params.append("rarity", filterRarity.value);
  }
  return params.toString();
};

const fetchItems = async () => {
  try {
    loading.value = true;
    const queryString = buildQueryString();
    console.log("Fetching items with query:", queryString);
    const response = await get(`/admin/items?${queryString}`);
    console.log("Items API response:", response);
    console.log("Response type:", typeof response);
    console.log("Is array?", Array.isArray(response));
    console.log("Has data?", response && "data" in response);

    // Check if response has pagination structure
    if (response && typeof response === "object" && !Array.isArray(response)) {
      if ("data" in response && Array.isArray(response.data)) {
        // Pagination response
        items.value = response.data;
        total.value = Number(response.total) || 0;
        // Tính lại totalPages nếu backend trả về sai
        const calculatedTotalPages =
          total.value > 0 ? Math.ceil(total.value / pageSize.value) : 0;
        totalPages.value = Number(response.totalPages) || calculatedTotalPages;
        // Nếu backend trả về totalPages sai, dùng giá trị tính toán
        if (
          response.totalPages &&
          Number(response.totalPages) !== calculatedTotalPages
        ) {
          console.warn(
            "Backend returned incorrect totalPages:",
            response.totalPages,
            "Calculated:",
            calculatedTotalPages
          );
          totalPages.value = calculatedTotalPages;
        }
        currentPage.value = Number(response.page) || 1;
        pageSize.value = Number(response.pageSize) || 10;
        console.log("✅ Pagination values:", {
          total: total.value,
          totalPages: totalPages.value,
          calculatedTotalPages: calculatedTotalPages,
          currentPage: currentPage.value,
          pageSize: pageSize.value,
          itemsCount: items.value.length,
        });
      } else {
        console.warn("Response has no data array:", response);
        items.value = [];
        total.value = 0;
        totalPages.value = 0;
      }
    } else if (Array.isArray(response)) {
      // Fallback: array response (old format)
      console.warn("Received array response instead of paginated object");
      items.value = response;
      total.value = response.length;
      totalPages.value = 1;
      currentPage.value = 1;
    } else {
      console.warn("Unexpected response format:", response);
      items.value = [];
      total.value = 0;
      totalPages.value = 0;
    }
  } catch (error: any) {
    console.error("Error fetching items:", error);
    console.error("Error response:", error.response?.data);
    items.value = [];
    total.value = 0;
    totalPages.value = 0;
    alert(
      "Lỗi khi tải dữ liệu: " + (error.response?.data?.message || error.message)
    );
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  // Reset to first page when searching
  currentPage.value = 1;
  fetchItems();
};

const clearFilters = () => {
  searchQuery.value = "";
  filterItemType.value = "";
  filterRarity.value = "";
  currentPage.value = 1;
  fetchItems();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchItems();
};

const handlePageSizeChange = (newPageSize: number) => {
  pageSize.value = newPageSize;
  currentPage.value = 1;
  fetchItems();
};

const createItem = async (data: any) => {
  try {
    loading.value = true;
    await post("/admin/items", data);
    await fetchItems();
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
  } catch (error: any) {
    console.error("Error updating item:", error);
    alert(
      "Lỗi khi cập nhật item: " +
        (error.response?.data?.message || error.message)
    );
  } finally {
    loading.value = false;
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

const editItem = (item: any) => {
  console.log("Edit item:", item);
  // Handled by ItemsTab component
};

onMounted(() => {
  fetchItems();
});
</script>
