<!-- src/components/SignUp.vue -->
<template>
  <section class="bg-zinc-100 dark:bg-zinc-900 w-screen min-h-screen md:max-w-screen min-h-screen-xl bg-white dark:bg-gray-800 bg-white dark:bg-gray-800md:m-auto p-4 flex flex-col">
    <h1 class="text-4xl font-display font-extrabold text-gray-800 dark:text-zinc-400">Yuwa</h1>
    <div class="flex flex-col items-center text-gray-800 dark:text-zinc-400">
      <img src="@/assets/illustrations/undraw_sign_up.svg" alt="Yuwa logo" class="w-3/4 mt-14"/>
      <h3 class="text-3xl font-bold font-body mt-5">Create an account</h3>
      <p class="mt-1">Already in the crew?
        <router-link to="login" class="text-indigo-500 font-semibold">Login here</router-link>
      </p>
    </div>
    <form @submit.prevent="handleSignUp" class="flex flex-col flex-1 mt-5">
      <div class="flex gap-3 flex-col flex-1">
        <BaseInput name="username" v-model="username" placeholder="Username" type="text" required/>
        <BaseInput name="email" v-model="email" placeholder="Email" type="email" required/>
        <BaseInput name="password" v-model="password" placeholder="Password" type="password" required/>
      </div>
      <div>
        <BaseButton type="submit" class="w-full mb-4">Continue</BaseButton>
        <p>By clicking Create an account you agree to recognize <span class="text-indigo-500">Therms of use</span> and  <span class="text-indigo-500">Privacy Policy</span></p>
      </div>
    </form>
    <p v-if="error">{{ error }}</p>
  </section>
</template>

<script lang="ts" setup>
import {inject, ref} from 'vue'
import {AuthService} from '@/services/AuthService.ts';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import {useRouter} from 'vue-router';

const authService = inject('authService') as AuthService
const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const handleSignUp = async () => {
  const {data, error: signUpError} = await authService.signUp(username.value, email.value, password.value)
  if (signUpError) {
    error.value = signUpError.message
  } else {
    await router.push('/')
  }
}
</script>

<style scoped>
/* Add your styles here */
</style>
