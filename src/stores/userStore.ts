// src/store/userStore.ts
import {defineStore} from 'pinia'
import {inject, ref} from 'vue'
import {User} from '@/domain/User.ts';
import {UserService} from '@/resourses/UserService.ts';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const userService = inject('userService') as UserService;

  const fetchUser = async () => {
    if(user.value) return;
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

  return {user, fetchUser, clearUser}
})
