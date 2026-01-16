<template>
  <div
    class="game-navigation bg-black/50 backdrop-blur-sm border-b border-purple-500/30"
  >
    <!-- Level 1: Category Tabs -->
    <div class="flex gap-0.5 px-0.5 py-0.5 overflow-x-auto scrollbar-hide">
      <button
        v-for="category in MAIN_CATEGORIES"
        :key="category.id"
        @click="
          activeMainCategory = category.id;
          activeSubCategory = category.subCategories[0]?.id || '';
        "
        class="px-1.5 py-0.5 rounded text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
        :class="
          getMainCategoryClass(category.id, activeMainCategory === category.id)
        "
      >
        {{ category.label }}
        <span
          v-if="category.tag"
          class="hidden ml-1 text-xs bg-cyan-400/30 text-gray-900 px-1 py-0.5 rounded"
        >
          {{ category.tag }}
        </span>
      </button>
    </div>

    <!-- Level 2: Sub-Category Buttons -->
    <div
      v-if="activeSubCategories.length > 0"
      class="flex gap-0.5 px-0.5 mt-0.5 overflow-x-auto scrollbar-hide"
    >
      <button
        v-for="subCat in activeSubCategories"
        :key="subCat.id"
        @click="activeSubCategory = subCat.id"
        class="px-1.5 py-0.5 rounded text-xs whitespace-nowrap flex-shrink-0 transition-all"
        :class="
          getSubCategoryClass(
            subCat.id,
            activeSubCategory === subCat.id,
            activeMainCategory
          )
        "
      >
        {{ subCat.label }}
      </button>
    </div>

    <!-- Level 2: Feature Grid - Horizontal Scrollable -->
    <Transition mode="out-in" name="fade">
      <div
        :key="`${activeMainCategory}-${activeSubCategory}`"
        class="overflow-x-auto scrollbar-hide px-0.5 pb-0.5 mt-0.5"
        style="scrollbar-width: none; -ms-overflow-style: none"
      >
        <div class="flex gap-1 min-w-max">
          <button
            v-for="feature in activeFeatures"
            :key="feature.id"
            @click="handleFeatureClick(feature)"
            class="flex flex-col items-center justify-start gap-0.5 p-0.5 rounded transition-all hover:scale-105 group flex-shrink-0 w-[57.6px] h-[69.2px]"
            :class="feature.disabled ? 'opacity-50 cursor-not-allowed' : ''"
          >
            <div
              class="w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0"
              :class="getFeatureButtonClass(feature, activeMainCategory)"
            >
              <component :is="feature.icon" :size="19" />
            </div>
            <span
              class="text-[10px] text-center transition-colors leading-tight h-[18px] flex items-center justify-center"
              :class="getFeatureLabelClass(feature, activeMainCategory)"
            >
              {{ feature.label }}
            </span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Users,
  Sword,
  Backpack,
  Flame,
  Heart,
  Shield,
  Wind,
  Gem,
  Trophy,
  Palette,
  Scroll,
  RotateCcw,
  Building,
  Home,
  Aperture,
  ShoppingBag,
  Rabbit,
  Sprout,
} from "lucide-vue-next";

interface MenuFeature {
  id: string;
  label: string;
  icon: any;
  disabled?: boolean;
  highlight?: boolean;
  viewId?: string;
}

interface SubCategory {
  id: string;
  label: string;
  features: MenuFeature[];
}

interface MainCategory {
  id: string;
  label: string;
  tag?: string;
  subCategories: SubCategory[];
}

const MAIN_CATEGORIES: MainCategory[] = [
  {
    id: "nhan-vat",
    label: "Nhân Vật",
    subCategories: [
      {
        id: "cong-phap",
        label: "Công Pháp",
        features: [
          {
            id: "ban-than",
            label: "Bản Thân",
            icon: Scroll,
            viewId: "character",
          },
          {
            id: "trang-bi",
            label: "Trang Bị",
            icon: Sword,
            viewId: "equipment",
          },
          {
            id: "thien-phu",
            label: "Thiên Phú",
            icon: Sprout,
            viewId: "talents",
          },
          {
            id: "tu-luyen",
            label: "Tu Luyện",
            icon: Aperture,
            viewId: "elements",
          },
          {
            id: "ky-nang",
            label: "Kỹ Năng",
            icon: Sword,
            viewId: "skills",
          },
          { id: "luyen-khi", label: "Luyện Khí", icon: Wind },
          { id: "dao-lo", label: "Đạo Lô", icon: Flame },
        ],
      },
      {
        id: "tui",
        label: "Túi",
        features: [
          {
            id: "tui-do",
            label: "Túi Đồ",
            icon: Backpack,
            viewId: "inventory",
          },
          { id: "phap-bao", label: "Pháp Bảo", icon: Sword },
          { id: "co-bao", label: "Cổ Bảo", icon: Gem },
        ],
      },
      {
        id: "dong-phu",
        label: "Động Phủ",
        features: [
          { id: "dong-phu", label: "Động Phủ", icon: Home, highlight: true },
          { id: "trang-tri", label: "Trang Trí", icon: Palette },
        ],
      },
      {
        id: "khac",
        label: "Khác",
        features: [
          {
            id: "thanh-tuu",
            label: "Thành Tựu",
            icon: Trophy,
            viewId: "achievements",
          },
          { id: "linh-thu", label: "Linh Thú", icon: Rabbit },
        ],
      },
    ],
  },
  {
    id: "dong-doi",
    label: "Đồng Đội",
    subCategories: [
      {
        id: "tong-mon",
        label: "Tông Môn",
        features: [
          { id: "tong-mon", label: "Tông Môn", icon: Building },
          { id: "bang-hoi", label: "Bang Hội", icon: Building },
        ],
      },
      {
        id: "tien-huu",
        label: "Tiên Hữu",
        features: [
          { id: "tien-huu", label: "Tiên Hữu", icon: Users, viewId: "friends" },
          { id: "ban-be", label: "Bạn Bè", icon: Users, viewId: "friends" },
          { id: "dao-lu", label: "Đạo Lữ", icon: Heart },
        ],
      },
      {
        id: "doi-nhom",
        label: "Đội Nhóm",
        features: [
          { id: "doi-nhom", label: "Đội Nhóm", icon: Users },
          { id: "tien-duyen", label: "Tiên Duyên", icon: RotateCcw },
        ],
      },
      {
        id: "khac",
        label: "Khác",
        features: [{ id: "dao-quan", label: "Đạo Quán", icon: Building }],
      },
    ],
  },
  {
    id: "chien-dau",
    label: "Chiến Đấu",
    subCategories: [
      {
        id: "bi-canh",
        label: "Bí Cảnh",
        features: [
          { id: "bi-canh", label: "Bí Cảnh", icon: Gem },
          { id: "pho-ban", label: "Phó Bản", icon: Scroll },
        ],
      },
      {
        id: "du-ngoan",
        label: "Du Ngoạn",
        features: [
          { id: "du-ngoan", label: "Du Ngoạn", icon: Aperture },
          { id: "tham-hien", label: "Thám Hiểm", icon: Scroll },
        ],
      },
      {
        id: "chien-truong",
        label: "Chiến Trường",
        features: [
          { id: "chien-dau", label: "Chiến Đấu", icon: Sword, viewId: "combat" },
          { id: "pvp", label: "PVP", icon: Shield, viewId: "combat" },
          { id: "arena", label: "Arena", icon: Trophy },
        ],
      },
      {
        id: "khac",
        label: "Khác",
        features: [
          {
            id: "xep-hang",
            label: "Xếp Hạng",
            icon: Trophy,
            viewId: "leaderboard",
          },
        ],
      },
    ],
  },
  {
    id: "su-kien",
    label: "Sự Kiện",
    subCategories: [
      {
        id: "boss",
        label: "Boss",
        features: [
          { id: "danh-boss", label: "Đánh Boss", icon: Trophy },
          { id: "boss-event", label: "Boss Sự Kiện", icon: Trophy },
        ],
      },
      {
        id: "hoat-dong",
        label: "Hoạt Động",
        features: [
          { id: "su-kien", label: "Sự Kiện", icon: Scroll },
          { id: "nhiem-vu", label: "Nhiệm Vụ", icon: Scroll },
        ],
      },
      {
        id: "thuong-mai",
        label: "Thương Mại",
        features: [
          {
            id: "cua-hang",
            label: "Cửa Hàng",
            icon: ShoppingBag,
            viewId: "shop",
          },
          { id: "thuong-mai", label: "Thương Mại", icon: ShoppingBag },
        ],
      },
      {
        id: "khac",
        label: "Khác",
        features: [
          {
            id: "thong-bao",
            label: "Thông Báo",
            icon: Scroll,
            viewId: "notifications",
          },
        ],
      },
    ],
  },
];

const activeMainCategory = ref<string>("nhan-vat");
const activeSubCategory = ref<string>("cong-phap");

const activeSubCategories = computed(() => {
  const mainCat = MAIN_CATEGORIES.find(
    (cat) => cat.id === activeMainCategory.value
  );
  return mainCat?.subCategories || [];
});

const activeFeatures = computed(() => {
  const subCat = activeSubCategories.value.find(
    (sub) => sub.id === activeSubCategory.value
  );
  return subCat?.features || [];
});

const emit = defineEmits<{
  "feature-click": [featureId: string, viewId?: string];
}>();

const handleFeatureClick = (feature: MenuFeature) => {
  if (feature.disabled) return;
  emit("feature-click", feature.id, feature.viewId);
};

// Color mapping functions
const getMainCategoryClass = (
  categoryId: string,
  isActive: boolean
): string => {
  if (!isActive) {
    return "bg-gray-800 text-gray-300 hover:bg-gray-700";
  }

  const colorMap: Record<string, string> = {
    "nhan-vat": "bg-slate-300 text-gray-900 shadow-lg shadow-cyan-400/50",
    "dong-doi": "bg-blue-600 text-white shadow-lg shadow-blue-500/50",
    "chien-dau": "bg-red-600 text-white shadow-lg shadow-red-500/50",
    "su-kien": "bg-yellow-200 text-gray-900 shadow-lg shadow-yellow-300/50",
  };

  return (
    colorMap[categoryId] ||
    "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
  );
};

const getSubCategoryClass = (
  _subCatId: string,
  isActive: boolean,
  mainCategoryId: string
): string => {
  if (!isActive) {
    return "text-gray-400 hover:text-gray-300";
  }

  // Map main category to sub category colors
  const mainColorMap: Record<string, string> = {
    "nhan-vat": "bg-slate-200/80 text-gray-900 border border-cyan-300/50 shadow-sm",
    "dong-doi": "bg-blue-500/30 text-blue-300 border border-blue-500/50",
    "chien-dau": "bg-red-500/30 text-red-300 border border-red-500/50",
    "su-kien": "bg-yellow-200/80 text-gray-900 border border-yellow-300/50 shadow-sm",
  };

  return (
    mainColorMap[mainCategoryId] ||
    "bg-purple-500/30 text-purple-300 border border-purple-500/50"
  );
};

const getFeatureButtonClass = (
  feature: MenuFeature,
  mainCategoryId: string
): string => {
  if (feature.highlight) {
    return "bg-gradient-to-b from-slate-200 to-slate-300 border-2 border-cyan-300 text-gray-900 shadow-[0_0_15px_rgba(125,211,252,0.5)]";
  }

  if (feature.disabled) {
    return "bg-gray-700 text-gray-500 border-2 border-gray-600";
  }

  // Color based on main category with cultivation theme
  const hoverColorMap: Record<string, string> = {
    "nhan-vat":
      "hover:border-cyan-300/50 hover:shadow-[0_0_10px_rgba(125,211,252,0.3)]",
    "dong-doi":
      "hover:border-blue-400/50 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]",
    "chien-dau":
      "hover:border-red-400/50 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)]",
    "su-kien":
      "hover:border-yellow-300/50 hover:shadow-[0_0_10px_rgba(253,224,71,0.3)]",
  };

  const hoverClass =
    hoverColorMap[mainCategoryId] ||
    "hover:border-cyan-300/50 hover:shadow-[0_0_10px_rgba(125,211,252,0.3)]";

  // Background color based on category
  const bgColorMap: Record<string, string> = {
    "nhan-vat": "bg-gradient-to-b from-slate-200 to-slate-300",
    "dong-doi": "bg-gradient-to-b from-slate-200 to-slate-300",
    "chien-dau": "bg-gradient-to-b from-slate-200 to-slate-300",
    "su-kien": "bg-gradient-to-b from-yellow-200 to-yellow-300",
  };

  const bgClass = bgColorMap[mainCategoryId] || "bg-gradient-to-b from-slate-200 to-slate-300";
  const borderClass = mainCategoryId === "su-kien" ? "border-yellow-300/50" : "border-slate-400/50";

  return `${bgClass} text-gray-900 border-2 ${borderClass} ${hoverClass}`;
};

const getFeatureLabelClass = (
  feature: MenuFeature,
  mainCategoryId: string
): string => {
  if (feature.disabled) {
    return "text-gray-500";
  }

  if (feature.highlight) {
    return "text-green-300";
  }

  // Color based on main category
  const labelColorMap: Record<string, string> = {
    "nhan-vat": "text-gray-900",
    "dong-doi": "text-blue-300",
    "chien-dau": "text-red-300",
    "su-kien": "text-gray-900",
  };

  return labelColorMap[mainCategoryId] || "text-gray-300";
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
