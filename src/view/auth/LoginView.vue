<!-- src/components/Login.vue -->
<template>
  <section class="bg-zinc-100 dark:bg-zinc-900 w-screen min-h-screen min-h-screen md:max-w-screen min-h-screen-xl md:m-auto p-4 flex flex-col">
    <h1 class="text-4xl font-display font-extrabold text-gray-800 dark:text-zinc-400">Yuwa</h1>
    <div class="flex flex-col items-center text-gray-800 dark:text-zinc-400">
      <img src="@/assets/illustrations/undraw_login.svg" alt="Yuwa logo" class="w-full mt-20"/>
      <h3 class="text-3xl font-bold font-body mt-5 text-center" v-html="heading"></h3>
      <p v-if="groupName">Login or  <router-link to="register" class="text-indigo-500 font-semibold">Register here!</router-link></p>
      <p v-else class="mt-1">Not yet with us?
        <router-link to="register" class="text-indigo-500 font-semibold">Join us!</router-link>
      </p>
    </div>
    <form @submit.prevent="handleLogin" class="flex flex-col flex-1 mt-5">
      <div class="flex gap-3 flex-col flex-1">
        <BaseInput name="email" v-model="email" placeholder="Email" type="email" required/>
        <BaseInput name="password" v-model="password" placeholder="Password" type="password" required/>
      </div>
      <div>
        <BaseButton type="submit" class="w-full mb-4">Continue</BaseButton>
      </div>
    </form>
    <p v-if="error">{{ error }}</p>
  </section>
</template>

<script lang="ts" setup>
import {computed, inject, ref} from 'vue'
import { useRouter } from 'vue-router'
import {AuthService} from '@/services/AuthService.ts';
import BaseButton from '@/components/BaseButton.vue';
import BaseInput from '@/components/BaseInput.vue';

const authService = inject('authService') as AuthService
const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const groupName = computed(() => {
  const route = router.currentRoute.value
  return route.query.groupName as string
})

const returnURL = computed(() => {
  const route = router.currentRoute.value
  return route.query.returnUrl as string
})

const heading = computed(() => {
  return groupName.value ? `<span class=''>Join</span><br><span class="text-indigo-500">${groupName.value}</span>?` : 'Welcome back!'
})

const handleLogin = async () => {
  const { data, error: signInError } = await authService.signIn(email.value, password.value)
  if (signInError) {
    error.value = signInError.message
  } else {
    if (groupName.value) {
      await router.push(returnURL.value)
      return
    }
    await router.push('/')
  }
}
</script>

<style scoped>
/* Add your styles here */
</style>
