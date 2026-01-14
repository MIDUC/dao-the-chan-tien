<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <!-- Admin Header -->
    <header class="bg-gray-900/80 backdrop-blur-sm border-b border-gray-600/30 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold text-gray-300">⚙️ Admin Panel</h1>
            <router-link
              to="/"
              class="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Về Game
            </router-link>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-400">
              {{ authState.user?.username }}
            </span>
            <button
              @click="handleLogout"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-8">
        <!-- Sidebar Navigation -->
        <aside class="w-64 flex-shrink-0">
          <nav class="bg-gray-800/50 rounded-lg p-4 border border-gray-600/20">
            <ul class="space-y-2">
              <li>
                <router-link
                  to="/admin/users"
                  class="block px-4 py-2 rounded transition-colors"
                  :class="
                    $route.path === '/admin/users'
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  "
                >
                  👥 Quản lý Users
                </router-link>
              </li>
              <li>
                <router-link
                  to="/admin/items"
                  class="block px-4 py-2 rounded transition-colors"
                  :class="
                    $route.path === '/admin/items'
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  "
                >
                  🎒 Quản lý Items
                </router-link>
              </li>
              <li>
                <router-link
                  to="/admin/npcs"
                  class="block px-4 py-2 rounded transition-colors"
                  :class="
                    $route.path === '/admin/npcs'
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  "
                >
                  🧙 Quản lý NPCs
                </router-link>
              </li>
              <li>
                <router-link
                  to="/admin/quests"
                  class="block px-4 py-2 rounded transition-colors"
                  :class="
                    $route.path === '/admin/quests'
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  "
                >
                  📜 Quản lý Quests
                </router-link>
              </li>
              <li>
                <router-link
                  to="/admin/roles"
                  class="block px-4 py-2 rounded transition-colors"
                  :class="
                    $route.path === '/admin/roles'
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  "
                >
                  🔐 Quản lý Roles
                </router-link>
              </li>
              <li>
                <router-link
                  to="/admin/configs"
                  class="block px-4 py-2 rounded transition-colors"
                  :class="
                    $route.path === '/admin/configs'
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  "
                >
                  ⚙️ System Configs
                </router-link>
              </li>
            </ul>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="flex-1">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../../composables/useAuth';
import { useRouter } from 'vue-router';

const { authState, logout } = useAuth();
const router = useRouter();

const handleLogout = () => {
  logout();
  router.push('/');
};
</script>

