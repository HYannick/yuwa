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
import {inject} from 'vue';
import {GroupService} from '@/services/GroupService.ts';
import {ExpenseService} from '@/services/ExpenseService.ts';
import EditExpense from '@/view/group/EditExpense.vue';
import GroupRequest from '@/view/group/GroupRequest.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/auth/register',
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
    path: '/auth/login',
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
    path: '/groups/join',
    name: 'joinGroup',
    component: JoinGroup,
    meta: { requiresAuth: true },
  },
  {
    path: '/groups/request',
    name: 'groupRequest',
    component: GroupRequest,
    meta: { requiresAuth: true },
  },
  {
    path: '/groups/create',
    name: 'groupCreate',
    component: GroupCreationView,
    meta: { requiresAuth: true },
  },
  {
    path: '/groups/:id',
    name: 'groupDetails',
    component: GroupDashboardView,
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: '/groups/:groupId/add-expense',
    name: 'addExpense',
    component: AddExpense,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/groups/:id/add-settlement',
    name: 'addSettlement',
    component: AddSettlementView,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/groups/:groupId/expenses/:expenseId/edit',
    name: 'editExpense',
    component: EditExpense,
    meta: { requiresAuth: true },
    props: true
  },
]


const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ left: 0, top: 0 })
      }, 500)
    })
  },
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !userStore.user) {
    await userStore.fetchUser();
    if (userStore.user) {
      next()
    } else {
      next('/auth/login')
    }
  } else {
    next()
  }
})

export default router;