<template>
  <div class="flex flex-col justify-center  rounded-xl bg-orange-50 border-2 border-orange-100 w-full p-5 my-10">
    <h3 class="">Remaining debt: <span class="font-bold">{{ formatCurrency(totalOwed, 'EUR') }}</span></h3>
    <div @click="openDebtDetails">View Details</div>
    <Teleport to="body">
      <div v-if="debtDetailsVisible" class="flex gap-2 flex-col mt-2 fixed z-50 bottom-0 left-0 right-0 p-5 bg-white h-4/5">
        <div class="flex justify-between items-center mb-5">
          <h3 class="font-display text-3xl">Your debts</h3>
          <button @click="closeDebtDetails" class="p-2">
            <XMarkIcon class="w-6 stroke-2"/>
          </button>
        </div>

        <router-link :to="`/groups/${debt.groupId}`" class="flex justify-between items-center border-2 p-2 rounded-lg border-gray-800"
                     v-for="debt in debts" :key="debt.creditorId">
          <div>
            <span class="font-bold">{{ debt.groupName }}</span>
            <div>You owe <span class="font-bold">{{ formatCurrency(debt.amount, 'EUR') }}</span></div>
          </div>
          <div>
            <ArrowTopRightOnSquareIcon class="w-5"/>
          </div>
        </router-link>
      </div>
    </Teleport>
  </div>
</template>
<script setup lang="ts">
import {formatCurrency} from '@/utils/common.utils.ts';
import {ArrowTopRightOnSquareIcon, XMarkIcon} from '@heroicons/vue/24/outline';
import {inject, onMounted, ref} from 'vue';
import {UserService} from '@/resourses/UserService.ts';
import {useUserStore} from '@/stores/userStore.ts';

const userService = inject('userService') as UserService;
const userStore = useUserStore();

const debtDetailsVisible = ref(false);
const debts = ref<any[]>([]);
const totalOwed = ref(0);
const openDebtDetails = () => {
  debtDetailsVisible.value = true;
}
const closeDebtDetails = () => {
  debtDetailsVisible.value = false;
}

onMounted(async () => {
  try {
    const {debts: userDebts, totalOwed: total} = await userService.getUserDebtsRecap(userStore.user!.auth_id);
    debts.value = userDebts;
    totalOwed.value = total;
  } catch (error) {
    // Handle error
  }
})
</script>