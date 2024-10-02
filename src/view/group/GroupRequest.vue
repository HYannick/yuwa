<template>
  <section class="bg-zinc-100 dark:bg-zinc-900 w-screen min-h-screen md:max-w-screen min-h-screen-xl md:m-auto p-5">
    <div class="flex justify-between">
      <BackRouterButton to="/"/>
    </div>
    <h2 class="text-center text-4xl font-bold font-display my-10">Ready to join a group?</h2>
    <div v-if="qrCodeScannerOpened">
      <qrcode-stream
          @detect="onDetect"
          @error="onError"
          class="rounded-3xl overflow-hidden"
      ></qrcode-stream>
      <p>{{ error }}</p>
    </div>
    <img v-else src="@/assets/illustrations/undraw_meet_the_team.svg" alt="join group"/>
    <div class="flex-1 flex flex-col justify-center gap-4">
      <p class="text-xl text-center mt-10">Get the link from your group to join! or scan the qrcode</p>
      <BaseInput name="groupURL" placeholder="Enter the group Link" v-model="groupURL"/>
      <div class="flex gap-4">
        <BaseRouterLinkButton :to="`/groups/join?${sanitizedURL}`" class="flex-1">Join a group</BaseRouterLinkButton>
        <div class="w-14 flex justify-center items-center border-2 border-gray-800 rounded-xl" @click="openQRCodeScanner">
          <QrCodeIcon class="w-8 stroke-gray-800"/>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import BaseInput from '@/components/BaseInput.vue';
import {computed, ref} from 'vue';
import BackRouterButton from '@/components/BackRouterButton.vue';
import BaseRouterLinkButton from '@/components/BaseRouterLinkButton.vue';
import {QrCodeIcon} from '@heroicons/vue/24/outline';
import {useRouter} from 'vue-router';

const qrCodeScannerOpened = ref(false);
const openQRCodeScanner = () => {
  qrCodeScannerOpened.value = true;
}
const groupURL = ref('');
const error = ref('');
const result = ref('');
const sanitizedURL = computed(() => {
  const pattern = /\?(.*)/;
  return groupURL.value.match(pattern);
})

const onError = (err: { name: string, message: string }) => {
  error.value = `[${err.name}]: `

  if (err.name === 'NotAllowedError') {
    error.value += 'you need to grant camera access permission'
  } else if (err.name === 'NotFoundError') {
    error.value += 'no camera on this device'
  } else if (err.name === 'NotSupportedError') {
    error.value += 'secure context required (HTTPS, localhost)'
  } else if (err.name === 'NotReadableError') {
    error.value += 'is the camera already in use?'
  } else if (err.name === 'OverconstrainedError') {
    error.value += 'installed cameras are not suitable'
  } else if (err.name === 'StreamApiNotSupportedError') {
    error.value += 'Stream API is not supported in this browser'
  } else if (err.name === 'InsecureContextError') {
    error.value += 'Camera access is only permitted in secure context. Use HTTPS or localhost rather than HTTP.'
  } else {
    error.value += err.message
  }
}
const paused = ref(false)
const router = useRouter();
const onDetect = async (detectedCodes: { rawValue: string }[]) => {
  groupURL.value = detectedCodes.map(code => code.rawValue)[0]
  paused.value = true
  setTimeout(() => 500)
  paused.value = false;

  if (groupURL.value) {
    await router.push(`/groups/join?${sanitizedURL.value![1]}`)
  }
}

</script>