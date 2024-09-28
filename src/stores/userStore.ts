// src/store/userStore.ts
import {defineStore} from 'pinia'
import {inject, ref} from 'vue'
import {User} from '@/domain/User.ts';
import {UserService} from '@/resourses/UserService.ts';
import {AuthService} from '@/services/AuthService.ts';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const authService = inject('authService') as AuthService;
  const userService = inject('userService') as UserService;

  const fetchUser = async () => {
    try {
      const {data} = await userService.getUser()
      user.value = data
    } catch (error) {
      clearUser();
    }
  }

  const clearUser = () => {
    user.value = null
  }

  authService.watchAuthStateChange((_, session) => {
    if (session?.user) {
      fetchUser()
    } else {
      clearUser()
    }
  })

  return {user, fetchUser, clearUser}
})
