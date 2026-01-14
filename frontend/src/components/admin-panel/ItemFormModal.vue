<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div
      class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-600/30 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-300">
            {{ editingItem ? "Sửa Vật Phẩm" : "Tạo Vật Phẩm Mới" }}
          </h2>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Basic Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Tên *
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Loại *
              </label>
              <select
                v-model="formData.item_type"
                required
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
              >
                <option value="consumable">Tiêu hao</option>
                <option value="equipment">Trang bị</option>
                <option value="material">Nguyên liệu</option>
                <option value="quest_item">Vật phẩm nhiệm vụ</option>
                <option value="special">Đặc biệt</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              Mô tả
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              Phân loại
            </label>
            <input
              v-model="formData.category"
              type="text"
              placeholder="herb_common, weapon_sword, armor_plate..."
              class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Độ hiếm
              </label>
              <select
                v-model="formData.rarity"
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
              >
                <option value="common">Thường</option>
                <option value="uncommon">Không thường</option>
                <option value="rare">Hiếm</option>
                <option value="epic">Sử thi</option>
                <option value="legendary">Huyền thoại</option>
                <option value="mythic">Thần thoại</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Phẩm cấp
              </label>
              <input
                v-model.number="formData.grade"
                type="number"
                min="1"
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Số lượng tối đa
              </label>
              <input
                v-model.number="formData.max_stack"
                type="number"
                min="1"
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>

          <!-- Nguyên tố section riêng -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Nguyên tố (có thể chọn nhiều)
            </label>
            <div class="bg-gray-800/50 rounded-lg p-4 space-y-4">
              <!-- Ngũ Hành -->
              <div>
                <span
                  class="text-xs font-semibold text-gray-400 mb-3 block uppercase tracking-wide"
                  >Ngũ Hành</span
                >
                <div class="grid grid-cols-5 gap-2">
                  <label
                    v-for="elem in ['kim', 'moc', 'thuy', 'hoa', 'tho']"
                    :key="elem"
                    class="flex items-center gap-2 cursor-pointer px-3 py-2 rounded border border-gray-700 hover:border-gray-500 hover:bg-gray-500/10 transition-all"
                    :class="{
                      'border-gray-500 bg-gray-500/20':
                        formData.element.includes(elem),
                    }"
                  >
                    <input
                      type="checkbox"
                      :value="elem"
                      v-model="formData.element"
                      class="w-4 h-4 text-gray-600 bg-gray-800 border-gray-700 rounded focus:ring-gray-500"
                    />
                    <span class="text-sm text-gray-300 font-medium">
                      {{ getElementName(elem) }}
                    </span>
                  </label>
                </div>
              </div>
              <!-- Dị Nguyên Tố -->
              <div>
                <span
                  class="text-xs font-semibold text-blue-400 mb-3 block uppercase tracking-wide"
                  >Dị Nguyên Tố</span
                >
                <div class="grid grid-cols-4 gap-2">
                  <label
                    v-for="elem in [
                      'loi',
                      'bang',
                      'quang',
                      'am',
                      'phong',
                      'doc',
                      'thien',
                      'dia',
                    ]"
                    :key="elem"
                    class="flex items-center gap-2 cursor-pointer px-3 py-2 rounded border border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 transition-all"
                    :class="{
                      'border-blue-500 bg-blue-500/20':
                        formData.element.includes(elem),
                    }"
                  >
                    <input
                      type="checkbox"
                      :value="elem"
                      v-model="formData.element"
                      class="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-300 font-medium">
                      {{ getElementName(elem) }}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Equipment Specific -->
          <div
            v-if="formData.item_type === 'equipment'"
            class="border-t border-gray-700 pt-4 space-y-4"
          >
            <h3 class="text-lg font-semibold text-gray-300 mb-3">
              Thông tin Trang bị
            </h3>

            <!-- Basic Equipment Info -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Vị trí trang bị
                </label>
                <input
                  v-model="formData.equipment_slot"
                  type="text"
                  placeholder="weapon, armor, helmet..."
                  class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Cấp độ yêu cầu
                </label>
                <input
                  v-model.number="formData.required_level"
                  type="number"
                  min="1"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Cảnh giới yêu cầu
                </label>
                <input
                  v-model.number="formData.required_realm_level"
                  type="number"
                  min="1"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                />
              </div>
            </div>

            <!-- Equipment Stats (Fixed Stats) -->
            <div class="border-t border-gray-700 pt-4">
              <h4 class="text-md font-semibold text-gray-300 mb-2">
                Chỉ số cố định
              </h4>
              <p class="text-xs text-gray-400 mb-3">
                Dùng cho trang bị có chỉ số cố định
              </p>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">
                    Sức mạnh
                  </label>
                  <input
                    v-model.number="formData.equipment_stats.strength"
                    type="number"
                    min="0"
                    class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">
                    Nhanh nhẹn
                  </label>
                  <input
                    v-model.number="formData.equipment_stats.agility"
                    type="number"
                    min="0"
                    class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">
                    Trí tuệ
                  </label>
                  <input
                    v-model.number="formData.equipment_stats.wisdom"
                    type="number"
                    min="0"
                    class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">
                    Sinh lực
                  </label>
                  <input
                    v-model.number="formData.equipment_stats.hp"
                    type="number"
                    min="0"
                    class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">
                    Phòng thủ
                  </label>
                  <input
                    v-model.number="formData.equipment_stats.defense"
                    type="number"
                    min="0"
                    class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>
            </div>

            <!-- Base Config (Random Stats Range) -->
            <div class="border-t border-gray-700 pt-4">
              <h4 class="text-md font-semibold text-gray-300 mb-2">
                Khoảng chỉ số ngẫu nhiên
              </h4>
              <p class="text-xs text-gray-400 mb-3">
                Dùng cho trang bị có chỉ số ngẫu nhiên
              </p>
              <div class="space-y-3">
                <div class="grid grid-cols-4 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">
                      Sức mạnh Tối thiểu
                    </label>
                    <input
                      v-model.number="formData.base_config.strength_min"
                      type="number"
                      min="0"
                      class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">
                      Sức mạnh Tối đa
                    </label>
                    <input
                      v-model.number="formData.base_config.strength_max"
                      type="number"
                      min="0"
                      class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">
                      Nhanh nhẹn Tối thiểu
                    </label>
                    <input
                      v-model.number="formData.base_config.agility_min"
                      type="number"
                      min="0"
                      class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">
                      Nhanh nhẹn Tối đa
                    </label>
                    <input
                      v-model.number="formData.base_config.agility_max"
                      type="number"
                      min="0"
                      class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-4 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">
                      Trí tuệ Tối thiểu
                    </label>
                    <input
                      v-model.number="formData.base_config.wisdom_min"
                      type="number"
                      min="0"
                      class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">
                      Trí tuệ Tối đa
                    </label>
                    <input
                      v-model.number="formData.base_config.wisdom_max"
                      type="number"
                      min="0"
                      class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">
                      Sinh lực Tối thiểu
                    </label>
                    <input
                      v-model.number="formData.base_config.hp_min"
                      type="number"
                      min="0"
                      class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">
                      Sinh lực Tối đa
                    </label>
                    <input
                      v-model.number="formData.base_config.hp_max"
                      type="number"
                      min="0"
                      class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-4 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">
                      Phòng thủ Tối thiểu
                    </label>
                    <input
                      v-model.number="formData.base_config.defense_min"
                      type="number"
                      min="0"
                      class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">
                      Phòng thủ Tối đa
                    </label>
                    <input
                      v-model.number="formData.base_config.defense_max"
                      type="number"
                      min="0"
                      class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div class="flex items-center gap-2 pt-6">
                    <input
                      v-model="formData.base_config.can_refine"
                      type="checkbox"
                      id="can_refine"
                      class="w-4 h-4 text-gray-600 bg-gray-800 border-gray-700 rounded focus:ring-gray-500"
                    />
                    <label for="can_refine" class="text-sm text-gray-300">
                      Có thể tinh luyện
                    </label>
                  </div>
                  <div class="flex items-center gap-2 pt-6">
                    <input
                      v-model="formData.base_config.can_socket"
                      type="checkbox"
                      id="can_socket"
                      class="w-4 h-4 text-gray-600 bg-gray-800 border-gray-700 rounded focus:ring-gray-500"
                    />
                    <label for="can_socket" class="text-sm text-gray-300">
                      Có thể khảm đá
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Qi Bonus -->
            <div class="border-t border-gray-700 pt-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-md font-semibold text-gray-300">
                  Qi Bonus khi trang bị
                </h4>
                <button
                  type="button"
                  @click="addQiBonus"
                  class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  + Thêm Qi Bonus
                </button>
              </div>
              <div
                v-if="formData.qi_bonus.length === 0"
                class="text-gray-400 text-sm mb-2"
              >
                Chưa có Qi bonus nào
              </div>
              <div
                v-for="(bonus, index) in formData.qi_bonus"
                :key="index"
                class="bg-gray-800/50 p-3 rounded mb-2"
              >
                <div class="grid grid-cols-4 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">
                      Loại Khí
                    </label>
                    <select
                      v-model="bonus.qi_type"
                      class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                    >
                      <option value="">Chọn loại khí</option>
                      <option value="blood_qi">Huyết Khí</option>
                      <option value="spiritual_qi">Linh Khí</option>
                      <option value="vital_qi">Nguyên Khí</option>
                      <option value="righteous_qi">Hạo Nhiên Khí</option>
                      <option value="killing_qi">Sát Khí</option>
                      <option value="scholarly_qi">Văn Khí</option>
                      <option value="demonic_qi">Ma Khí</option>
                      <option value="frost_qi">Hàn Khí</option>
                      <option value="yang_qi">Dương Khí</option>
                      <option value="yin_qi">Âm Khí</option>
                      <option value="impure_qi">Trọc Khí</option>
                      <option value="prenatal_qi">Tiên Thiên Khí</option>
                      <option value="grandmist_purple_qi">
                        Hồng Mông Tử Khí
                      </option>
                      <option value="chaos_qi">Hỗn Độn Khí</option>
                      <option value="imperial_qi">Đế Khí</option>
                      <option value="aura_qi">Cương Khí</option>
                      <option value="corpse_qi">Thi Khí</option>
                      <option value="death_qi">Tử Khí</option>
                      <option value="resentment_qi">Oán Khí</option>
                      <option value="charm_qi">Mị Khí</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">
                      Số lượng
                    </label>
                    <input
                      v-model.number="bonus.amount"
                      type="number"
                      min="0"
                      placeholder="Số lượng Qi"
                      class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">
                      Mỗi phút
                    </label>
                    <input
                      v-model.number="bonus.per_minute"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Hồi phục khí/phút"
                      class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div class="flex items-end">
                    <button
                      type="button"
                      @click="removeQiBonus(index)"
                      class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors w-full"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Price & Sell -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Giá bán
              </label>
              <input
                v-model.number="formData.sell_price"
                type="number"
                min="0"
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
              />
            </div>
            <div class="flex items-center gap-2 pt-6">
              <input
                v-model="formData.sellable"
                type="checkbox"
                id="sellable"
                class="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
              />
              <label for="sellable" class="text-sm text-gray-300">
                Có thể bán
              </label>
            </div>
            <div class="flex items-center gap-2 pt-6">
              <input
                v-model="formData.usable"
                type="checkbox"
                id="usable"
                class="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
              />
              <label for="usable" class="text-sm text-gray-300">
                Có thể sử dụng
              </label>
            </div>
          </div>

          <!-- Icon URL -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              Hình ảnh
            </label>
            <div class="space-y-2">
              <!-- File Upload -->
              <div>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="() => (fileInput as HTMLInputElement)?.click()"
                  class="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded px-3 py-2 text-white transition-colors"
                >
                  {{ uploading ? "Đang tải lên..." : "Chọn ảnh từ máy tính" }}
                </button>
              </div>
              <!-- URL Input (fallback) -->
              <div>
                <input
                  v-model="formData.icon_url"
                  type="text"
                  placeholder="Hoặc nhập URL Cloudinary (https://res.cloudinary.com/...)"
                  class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                />
              </div>
              <!-- Preview -->
              <div v-if="formData.icon_url" class="mt-2">
                <img
                  :src="formData.icon_url"
                  alt="Preview"
                  class="max-w-xs max-h-32 object-contain rounded border border-gray-700"
                  @error="handleImageError"
                />
              </div>
            </div>
          </div>

          <!-- Active Status -->
          <div class="flex items-center gap-2">
            <input
              v-model="formData.is_active"
              type="checkbox"
              id="is_active"
              class="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
            />
            <label for="is_active" class="text-sm text-gray-300">
              Vật phẩm đang hoạt động
            </label>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="submit"
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              {{ editingItem ? "Cập nhật" : "Tạo mới" }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { api } from "../../composables/useApi";

const props = defineProps<{
  show: boolean;
  editingItem?: any;
}>();

const emit = defineEmits<{
  close: [];
  submit: [data: any];
}>();

const formData = ref({
  name: "",
  description: "",
  item_type: "consumable",
  category: "",
  grade: 1,
  rarity: "common",
  max_stack: 1,
  sellable: true,
  sell_price: 0,
  usable: false,
  equipment_slot: null as string | null,
  required_level: 1,
  required_realm_level: 1,
  element: [] as string[],
  icon_url: "",
  is_active: true,
  equipment_stats: {
    strength: null as number | null,
    agility: null as number | null,
    wisdom: null as number | null,
    hp: null as number | null,
    defense: null as number | null,
  },
  base_config: {
    strength_min: null as number | null,
    strength_max: null as number | null,
    agility_min: null as number | null,
    agility_max: null as number | null,
    wisdom_min: null as number | null,
    wisdom_max: null as number | null,
    hp_min: null as number | null,
    hp_max: null as number | null,
    defense_min: null as number | null,
    defense_max: null as number | null,
    can_refine: false,
    can_socket: false,
  },
  qi_bonus: [] as Array<{
    qi_type?: string;
    amount?: number;
    per_minute?: number;
  }>,
});

watch(
  () => props.editingItem,
  (item) => {
    if (item) {
      formData.value = {
        name: item.name || "",
        description: item.description || "",
        item_type: item.item_type || "consumable",
        category: item.category || "",
        grade: item.grade || 1,
        rarity: item.rarity || "common",
        max_stack: item.max_stack || 1,
        sellable: item.sellable !== undefined ? item.sellable : true,
        sell_price: item.sell_price || 0,
        usable: item.usable !== undefined ? item.usable : false,
        equipment_slot: item.equipment_slot || null,
        required_level: item.required_level || 1,
        required_realm_level: item.required_realm_level || 1,
        element: Array.isArray(item.element)
          ? item.element
          : item.element
          ? [item.element]
          : [],
        icon_url: item.icon_url || "",
        is_active: item.is_active !== undefined ? item.is_active : true,
        equipment_stats: item.equipment_stats || {
          strength: null,
          agility: null,
          wisdom: null,
          hp: null,
          defense: null,
        },
        base_config: item.base_config || {
          strength_min: null,
          strength_max: null,
          agility_min: null,
          agility_max: null,
          wisdom_min: null,
          wisdom_max: null,
          hp_min: null,
          hp_max: null,
          defense_min: null,
          defense_max: null,
          can_refine: false,
          can_socket: false,
        },
        qi_bonus: item.qi_bonus || [],
      };
    } else {
      // Reset form
      formData.value = {
        name: "",
        description: "",
        item_type: "consumable",
        category: "",
        grade: 1,
        rarity: "common",
        max_stack: 1,
        sellable: true,
        sell_price: 0,
        usable: false,
        equipment_slot: null,
        required_level: 1,
        required_realm_level: 1,
        element: [],
        icon_url: "",
        is_active: true,
        equipment_stats: {
          strength: null,
          agility: null,
          wisdom: null,
          hp: null,
          defense: null,
        },
        base_config: {
          strength_min: null,
          strength_max: null,
          agility_min: null,
          agility_max: null,
          wisdom_min: null,
          wisdom_max: null,
          hp_min: null,
          hp_max: null,
          defense_min: null,
          defense_max: null,
          can_refine: false,
          can_socket: false,
        },
        qi_bonus: [],
      };
    }
  },
  { immediate: true }
);

const addQiBonus = () => {
  formData.value.qi_bonus.push({
    qi_type: "",
    amount: undefined,
    per_minute: undefined,
  });
};

const removeQiBonus = (index: number) => {
  formData.value.qi_bonus.splice(index, 1);
};

const getElementName = (elem: string): string => {
  const names: Record<string, string> = {
    // Ngũ Hành
    kim: "Kim",
    moc: "Mộc",
    thuy: "Thủy",
    hoa: "Hỏa",
    tho: "Thổ",
    // Dị Nguyên Tố
    loi: "Lôi",
    bang: "Băng",
    quang: "Quang",
    am: "Ám",
    phong: "Phong",
    doc: "Độc",
    thien: "Thiên",
    dia: "Địa",
  };
  return names[elem] || elem;
};

const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    return;
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    alert("Vui lòng chọn file ảnh");
    return;
  }

  // Validate file size (max 10MB - có thể config)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    alert(
      `Kích thước file (${fileSizeMB}MB) vượt quá giới hạn 10MB. Vui lòng chọn file nhỏ hơn.`
    );
    return;
  }

  uploading.value = true;

  try {
    // Create FormData
    const formDataToUpload = new FormData();
    formDataToUpload.append("file", file);

    // Upload to Cloudinary via backend
    const response = await api.post("/upload/item", formDataToUpload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data?.url) {
      formData.value.icon_url = response.data.url;
      alert("Tải ảnh lên thành công!");
    } else {
      throw new Error("Không nhận được URL từ server");
    }
  } catch (error: any) {
    console.error("Error uploading image:", error);
    alert(
      error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi tải ảnh lên"
    );
  } finally {
    uploading.value = false;
    // Reset file input
    if (target) {
      target.value = "";
    }
  }
};

const handleImageError = () => {
  // Image failed to load, but don't clear the URL
  // User might have entered a URL that's temporarily unavailable
};

const handleSubmit = () => {
  // Clean up null values
  const cleanedData: any = {
    ...formData.value,
    equipment_slot: formData.value.equipment_slot || undefined,
    category: formData.value.category || undefined,
    icon_url: formData.value.icon_url || undefined,
    // Handle element array - convert to null if empty, otherwise keep as array
    element: formData.value.element.length > 0 ? formData.value.element : null,
  };

  // Clean equipment_stats - remove null values
  if (formData.value.item_type === "equipment") {
    cleanedData.equipment_stats = Object.fromEntries(
      Object.entries(formData.value.equipment_stats).filter(
        ([_, v]) => v !== null && v !== undefined
      )
    );
    if (Object.keys(cleanedData.equipment_stats).length === 0) {
      cleanedData.equipment_stats = undefined;
    }

    // Clean base_config - remove null values but keep false values
    cleanedData.base_config = Object.fromEntries(
      Object.entries(formData.value.base_config).filter(
        ([_, v]) => v !== null && v !== undefined
      )
    );
    // Remove base_config if all values are null/false
    const hasBaseConfig = Object.values(cleanedData.base_config).some(
      (v) => v !== null && v !== undefined && v !== false
    );
    if (!hasBaseConfig) {
      cleanedData.base_config = undefined;
    }

    // Clean qi_bonus - remove empty entries
    cleanedData.qi_bonus = formData.value.qi_bonus.filter(
      (bonus) =>
        bonus.qi_type && (bonus.amount !== null || bonus.per_minute !== null)
    );
    if (cleanedData.qi_bonus.length === 0) {
      cleanedData.qi_bonus = undefined;
    }
  } else {
    // Remove equipment-specific fields if not equipment
    cleanedData.equipment_stats = undefined;
    cleanedData.base_config = undefined;
    cleanedData.qi_bonus = undefined;
    cleanedData.equipment_slot = undefined;
  }

  emit("submit", cleanedData);
};
</script>
