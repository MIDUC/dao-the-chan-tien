<template>
  <div class="w-full max-w-md mx-auto bg-dao-card rounded-xl p-6 shadow-lg border border-dao-qi">
    <h2 class="text-2xl font-bold text-dao-gold mb-6 text-center">Đăng Nhập</h2>

    <form @submit.prevent="handleLogin" class="space-y-4">
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
        <label class="block text-sm text-gray-400 mb-2">Mật khẩu</label>
        <input
          v-model="password"
          type="password"
          required
          class="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-dao-qi focus:outline-none"
          placeholder="Nhập mật khẩu"
        />
      </div>

      <div v-if="error" class="text-red-400 text-sm text-center">{{ error }}</div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-dao-qi hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
      >
        {{ loading ? 'Đang đăng nhập...' : 'Đăng Nhập' }}
      </button>

      <div class="text-center text-sm text-gray-400">
        Chưa có tài khoản?
        <button
          type="button"
          @click="$emit('switch-to-register')"
          class="text-dao-gold hover:underline"
        >
          Đăng ký ngay
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';

const emit = defineEmits<{
  'switch-to-register': [];
  'login-success': [];
}>();

const { login } = useAuth();
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  const result = await login(username.value, password.value);

  if (result.success) {
    emit('login-success');
  } else {
    error.value = result.message || 'Đăng nhập thất bại';
  }

  loading.value = false;
};
</script>

