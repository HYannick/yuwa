import HomeView from '@/view/HomeView.vue';
import GroupCreationView from '@/view/group/GroupCreationView.vue';
import {createRouter, createWebHistory} from 'vue-router';
import RegisterView from '@/view/auth/RegisterView.vue';
import LoginView from '@/view/auth/LoginView.vue';
import {useUserStore} from '@/stores/userStore.ts';
import JoinGroup from '@/view/group/JoinGroup.vue';
import GroupDashboardView from '@/view/group/GroupDashboardView.vue';
import AddExpense from '@/view/group/AddExpense.vue';
import AddSettlementView from '@/view/group/AddSettlementView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    beforeEnter: async (to, from, next) => {
      const userStore = useUserStore()
      await userStore.fetchUser();
      if (userStore.user) {
        next('/')
      } else {
        next()
      }
    }
  },
  {
    path: '/join-group',
    name: 'join-group',
    component: JoinGroup,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    beforeEnter: async (to, from, next) => {
      const userStore = useUserStore()
      await userStore.fetchUser();
      if (userStore.user) {
        next('/')
      } else {
        next()
      }
    }
  },
  {
    path: '/groups/create',
    name: 'groups-create',
    component: GroupCreationView,
    meta: { requiresAuth: true },
  },
  {
    path: '/groups/:id',
    name: 'group-details',
    component: GroupDashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/groups/:id/add-expense',
    name: 'add-expense',
    component: AddExpense,
    meta: { requiresAuth: true },
  },
  {
    path: '/groups/:groupId/add-settlement',
    name: 'AddSettlement',
    component: AddSettlementView,
    meta: { requiresAuth: true },
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !userStore.user) {
    await userStore.fetchUser();
    if (userStore.user) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router;