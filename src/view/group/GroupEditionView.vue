<script setup lang="ts">
import BaseButton from '@/components/BaseButton.vue';
import {ref} from 'vue';

type GroupForm = {
  name: string;
  participants: string[];
}

const groupForm = ref<GroupForm>({
  name: '',
  participants: ['']
})
const addParticipant = () => {
  groupForm.value.participants.push('')
}
</script>

<template>
  <section class="w-screen md:max-w-screen-xl md:m-auto p-5 h-screen">
    <div class="flex flex-col h-full">
      <router-link to="groupCreate" tag="button">Back</router-link>
      <h2 class="font-body text-2xl font-bold my-5">Create your group</h2>
      <form class="flex flex-col flex-1">
        <input v-model="groupForm.name" class="rounded-xl p-4 w-full bg-gray-200 font-semibold" placeholder="Group name" type="text" id="name"
               name="name" required>
        <hr class="h-1 my-8 mx-auto w-52 bg-gray-100 rounded border-transparent"/>
        <div class="mb-4 flex-1">
          <p class="mb-4 font-bold">Participants</p>
          <div class="flex flex-col gap-2 mb-4">
            <div v-for="(_, i) in groupForm.participants" class="relative rounded-xl p-4 w-full bg-white border-2  border-gray-100 font-semibold">
              <input
                  class="w-full h-full border-transparent outline-0"
                  v-model="groupForm.participants[i]"
                  placeholder="Participant name" type="text"
                  name="participant" required>
              <button type="button" class="w-5 h-5 absolute right-0 border-transparent outline-transparent bg-indigo-500"></button>
            </div>
          </div>
          <div class="flex justify-end">
            <BaseButton type="button" bg-color="bg-gray-800" @click="addParticipant">Add participant</BaseButton>
          </div>
        </div>
        <BaseButton type="submit">Create the group</BaseButton>
      </form>
    </div>
  </section>
</template>

<style scoped>
</style>
