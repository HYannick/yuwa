<script lang="ts" setup>
import {ref, onMounted, inject} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {ExpenseService} from '@/services/ExpenseService.ts';
import {SettlementService} from '@/services/SettlementService.ts';
import {useUserStore} from '@/stores/userStore.ts';
import BaseSelect from '@/components/BaseSelect.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';


const expenseService = inject('expenseService') as ExpenseService;
const settlementService = inject('settlementService') as SettlementService;
const userStore = useUserStore();

const route = useRoute();
const router = useRouter();
const groupId = route.params.groupId as string;

const participants = ref<any[]>([]);
const payerId = ref(userStore.user?.id);
const payeeId = ref('');
const amount = ref(0);
const date = ref(new Date().toISOString());
const note = ref('');
const error = ref('');

const loadParticipants = async () => {
  const { data, error: fetchError } = await expenseService.fetchGroupParticipants(groupId);
  if (fetchError) {
    error.value = 'Failed to load participants.';
  } else {
    participants.value = data;
    // Exclude self from payee options if needed
  }
};

const handleAddSettlement = async () => {
  error.value = '';

  if (!payerId.value || !payeeId.value) {
    error.value = 'Please select both payer and payee.';
    return;
  }

  if (payerId.value === payeeId.value) {
    error.value = 'Payer and payee cannot be the same.';
    return;
  }

  if (amount.value <= 0) {
    error.value = 'Amount must be greater than zero.';
    return;
  }

  const { error: addError } = await settlementService.addSettlement({
    groupId,
    payerId: payerId.value,
    payeeId: payeeId.value,
    amount: amount.value,
    currency: 'EUR', // Replace with group currency if needed
    date: date.value,
    note: note.value,
  });

  if (addError) {
    error.value = 'Failed to add settlement.';
  } else {
    // Optionally navigate back or reset the form
    await router.push(`/groups/${groupId}`);
  }
};

onMounted(() => {
  loadParticipants();
});
</script>

<template>
  <section class="w-screen md:max-w-screen-xl md:m-auto p-5 h-screen">
    <div class="flex justify-between">
      <router-link :to="`/groups/${groupId}`" tag="button">Back</router-link>
    </div>
    <h2 class="text-center text-4xl font-bold my-10">Record a Settlement</h2>
    <form @submit.prevent="handleAddSettlement">
      <!-- Payer -->
      <div>
        <label class="font-bold" for="payer">Payer:</label>
        <BaseSelect v-model="payerId!" id="payer" name="payer" :options="[
          { label: 'Select payer', value: '' },
          ...participants.map((participant) => ({
            label: participant.name || participant.email,
            value: participant.id,
          })),
        ]" required />
      </div>
      <!-- Payee -->
      <div>
        <label class="font-bold" for="payee">Payee:</label>
        <BaseSelect v-model="payeeId!" id="payee" name="payee" :options="[
          { label: 'Select beneficiary', value: '' },
          ...participants.map((participant) => ({
            label: participant.name || participant.email,
            value: participant.id,
          })),
        ]" required />
      </div>
      <!-- Amount -->
      <div>
        <label class="font-bold" for="amount">Amount:</label>
        <BaseInput v-model.number="amount" type="number" step="0.01" id="amount" name="amount" required />
      </div>
      <!-- Date -->
      <div>
        <label class="font-bold" for="date">Date:</label>
        <BaseInput v-model="date" type="date" id="date" name="date" required />
      </div>
      <!-- Note -->
      <div>
        <label class="font-bold" for="note">Note:</label>
        <textarea v-model="note" class="rounded-xl p-5 w-full bg-gray-100 font-semibold" placeholder="Eg: Amazing trip to Antares"
                  id="note"></textarea>
      </div>
      <BaseButton type="submit">Add Settlement</BaseButton>
    </form>
    <p v-if="error">{{ error }}</p>
  </section>
</template>
