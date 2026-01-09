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
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';

const emit = defineEmits<{
  'switch-to-login': [];
  'register-success': [];
}>();

const { register } = useAuth();
const username = ref('');
const email = ref('');
const password = ref('');
const characterName = ref('');
const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  loading.value = true;
  error.value = '';

  const result = await register(
    username.value,
    email.value,
    password.value,
    characterName.value,
  );

  if (result.success) {
    emit('register-success');
  } else {
    error.value = result.message || 'Đăng ký thất bại';
  }

  loading.value = false;
};
</script>

