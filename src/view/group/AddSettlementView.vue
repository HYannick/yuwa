<script lang="ts" setup>
import {ref, onMounted, inject} from 'vue';
import { useRouter } from 'vue-router';
import {ExpenseService} from '@/services/ExpenseService.ts';
import {SettlementService} from '@/services/SettlementService.ts';
import {useUserStore} from '@/stores/userStore.ts';
import BaseSelect from '@/components/BaseSelect.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import BackRouterButton from '@/components/BackRouterButton.vue';
import BaseTextarea from '@/components/BaseTextarea.vue';

const props = defineProps<{
  id: string;
}>();
const expenseService = inject('expenseService') as ExpenseService;
const settlementService = inject('settlementService') as SettlementService;
const userStore = useUserStore();
const router = useRouter();

const participants = ref<any[]>([]);
const payerId = ref(userStore.user?.id);
const payeeId = ref('');
const amount = ref(0);
const date = ref(new Date().toISOString());
const note = ref('');
const error = ref('');

const loadParticipants = async () => {
  const { data, error: fetchError } = await expenseService.fetchGroupParticipants(props.id);
  if (fetchError) {
    error.value = 'Failed to load participants.';
  } else {
    participants.value = data;
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
    groupId: props.id,
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
    await router.push(`/groups/${props.id}`);
  }
};

onMounted(() => {
  loadParticipants();
});
</script>

<template>
  <section class="bg-zinc-100 dark:bg-zinc-900 w-screen min-h-screen md:max-w-screen min-h-screen-xl md:m-auto p-5">
    <div class="flex justify-between">

      <BackRouterButton :to="`/groups/${props.id}`" />
    </div>
    <h2 class="text-center text-4xl font-bold font-display my-10 text-gray-800 dark:text-zinc-400">Add a Settlement</h2>
    <form @submit.prevent="handleAddSettlement" class="flex flex-col gap-5">
      <!-- Payer -->
      <div>
        <BaseSelect label="Payer" v-model="payerId!" id="payer" name="payer" :options="[
          { label: 'Select payer', value: '' },
          ...participants.map((participant) => ({
            label: participant.name || participant.email,
            value: participant.id,
          })),
        ]" required />
      </div>
      <div>
        <BaseSelect label="Beneficiary" v-model="payeeId!" id="payee" name="payee" :options="[
          { label: 'Select beneficiary', value: '' },
          ...participants.map((participant) => ({
            label: participant.name || participant.email,
            value: participant.id,
          })),
        ]" required />
      </div>
      <div>
        <BaseInput label="Amount" v-model.number="amount" type="number" step="0.01" id="amount" name="amount" required />
      </div>
      <div>
        <BaseInput label="Date" v-model="date" type="date" id="date" name="date" required />
      </div>
      <div>
        <BaseTextarea label="Note" v-model="note" name="note" />
      </div>
      <BaseButton type="submit">Add Settlement</BaseButton>
    </form>
    <p v-if="error">{{ error }}</p>
  </section>
</template>
