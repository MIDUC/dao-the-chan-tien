<template>
  <div class="w-full max-w-md mx-auto bg-dao-card rounded-xl p-6 shadow-lg border border-dao-qi">
    <h2 class="text-2xl font-bold text-dao-gold mb-6 text-center">Đăng Ký</h2>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label class="block text-sm text-gray-400 mb-2">Tên đăng nhập</label>
        <input
          v-model="username"
          type="text"
          required
          class="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-dao-qi focus:outline-none"
          placeholder="Nhập tên đăng nhập"
        />
      </div>

      <div>
        <label class="block text-sm text-gray-400 mb-2">Email</label>
        <input
          v-model="email"
          type="email"
          required
          class="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-dao-qi focus:outline-none"
          placeholder="Nhập email"
        />
      </div>

      <div>
        <label class="block text-sm text-gray-400 mb-2">Mật khẩu</label>
        <input
          v-model="password"
          type="password"
          required
          minlength="6"
          class="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-dao-qi focus:outline-none"
          placeholder="Tối thiểu 6 ký tự"
        />
      </div>

      <div>
        <label class="block text-sm text-gray-400 mb-2">Tên nhân vật</label>
        <input
          v-model="characterName"
          type="text"
          required
          class="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-dao-qi focus:outline-none"
          placeholder="Tên nhân vật trong game"
        />
      </div>

      <!-- Talent Selection -->
      <div v-if="starterTalents.length > 0">
        <label class="block text-sm text-gray-400 mb-2">Chọn Thiên Phú Khởi Đầu</label>
        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="talent in starterTalents"
            :key="talent.id"
            @click="selectedTalentId = talent.id"
            class="talent-option p-3 rounded-lg border-2 cursor-pointer transition-all"
            :class="
              selectedTalentId === talent.id
                ? 'border-yellow-500 bg-yellow-900/20'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            "
          >
            <div class="text-xs font-semibold text-gray-200 mb-1">
              {{ talent.name }}
            </div>
            <div class="text-[10px] text-gray-400 line-clamp-2">
              {{ talent.description }}
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="loadingTalents" class="text-gray-400 text-sm text-center">
        Đang tải thiên phú...
      </div>

      <div v-if="error" class="text-red-400 text-sm text-center">{{ error }}</div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-dao-qi hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
      >
        {{ loading ? 'Đang đăng ký...' : 'Đăng Ký' }}
      </button>

      <div class="text-center text-sm text-gray-400">
        Đã có tài khoản?
        <button
          type="button"
          @click="$emit('switch-to-login')"
          class="text-dao-gold hover:underline"
        >
          Đăng nhập
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { api } from '../composables/useApi';

const emit = defineEmits<{
  'switch-to-login': [];
  'register-success': [];
}>();

const { register } = useAuth();
const username = ref('');
const email = ref('');
const password = ref('');
const characterName = ref('');
const selectedTalentId = ref<number | undefined>(undefined);
const starterTalents = ref<any[]>([]);
const loadingTalents = ref(false);
const loading = ref(false);
const error = ref('');

const fetchStarterTalents = async () => {
  loadingTalents.value = true;
  try {
    const response = await api.get('/talents/starters');
    starterTalents.value = response.data;
    // Auto-select first talent if available
    if (starterTalents.value.length > 0) {
      selectedTalentId.value = starterTalents.value[0].id;
    }
  } catch (error) {
    console.error('Error fetching starter talents:', error);
  } finally {
    loadingTalents.value = false;
  }
};

const handleRegister = async () => {
  loading.value = true;
  error.value = '';

  const result = await register(
    username.value,
    email.value,
    password.value,
    characterName.value,
    selectedTalentId.value,
  );

  if (result.success) {
    emit('register-success');
  } else {
    error.value = result.message || 'Đăng ký thất bại';
  }

  loading.value = false;
};

onMounted(() => {
  fetchStarterTalents();
});
</script>

