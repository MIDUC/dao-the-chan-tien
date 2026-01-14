import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/GameApp.vue'),
    },
    {
      path: '/admin',
      component: () => import('../pages/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          redirect: '/admin/users',
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../pages/admin/UsersPage.vue'),
        },
        {
          path: 'items',
          name: 'admin-items',
          component: () => import('../pages/admin/ItemsPage.vue'),
        },
        {
          path: 'npcs',
          name: 'admin-npcs',
          component: () => import('../pages/admin/NPCsPage.vue'),
        },
        {
          path: 'quests',
          name: 'admin-quests',
          component: () => import('../pages/admin/QuestsPage.vue'),
        },
        {
          path: 'roles',
          name: 'admin-roles',
          component: () => import('../pages/admin/RolesPage.vue'),
        },
        {
          path: 'configs',
          name: 'admin-configs',
          component: () => import('../pages/admin/ConfigsPage.vue'),
        },
      ],
    },
  ],
});

// Navigation guard
router.beforeEach(async (to, _from, next) => {
  const { isAdmin, checkAuth } = useAuth();

  // Check authentication
  if (to.meta.requiresAuth) {
    const authenticated = await checkAuth();
    if (!authenticated) {
      // Redirect to login
      next('/');
      return;
    }
  }

  // Check admin role
  if (to.meta.requiresAdmin) {
    if (!isAdmin.value) {
      // Redirect to home if not admin
      alert('Bạn không có quyền truy cập trang admin');
      next('/');
      return;
    }
  }

  next();
});

export default router;

