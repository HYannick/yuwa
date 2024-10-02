<script lang="ts" setup>
import {ref, onMounted, inject, watch, computed} from 'vue';
import {useUserStore} from '@/stores/userStore.ts';
import {ExpenseService} from '@/services/ExpenseService.ts';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseSelect from '@/components/BaseSelect.vue';
import {getUsernameFromParticipants} from '@/utils/common.utils.ts';
import {GroupParticipant} from '@/domain/GroupParticipant.ts';
import BackRouterButton from '@/components/BackRouterButton.vue';
import BaseTextarea from '@/components/BaseTextarea.vue';

const expenseService = inject('expenseService') as ExpenseService;
const userStore = useUserStore();
const description = ref('');
const amount = ref(0);
const currency = ref('USD');
const paidBy = ref(userStore.user?.auth_id);
const date = ref(new Date().toISOString());
const note = ref('');
const shareType = ref('equal');
const props = defineProps<{
  groupId: string;
}>();
const participants = ref<GroupParticipant[]>([]);
const selectedParticipantIds = ref<string[]>([]);
const participantShares = ref<{ [key: string]: number }>({});
const participantAdjusted = ref<{ [key: string]: boolean }>({});

const error = ref('');

type Debt = {
  from: string;
  to: string;
  amount: number;
};

const resetAdjustments = () => {
  participantAdjusted.value = {};
};

const onParticipantShareChange = (changedUserId: string) => {
  participantAdjusted.value[changedUserId] = true;

  if (shareType.value === 'unequal') {
    let totalAdjustedAmount = 0;
    let numUnadjustedParticipants = 0;

    selectedParticipantIds.value.forEach((userId) => {
      if (participantAdjusted.value[userId]) {
        totalAdjustedAmount += participantShares.value[userId] || 0;
      } else {
        numUnadjustedParticipants += 1;
      }
    });

    const remainingAmount = amount.value - totalAdjustedAmount;

    if (numUnadjustedParticipants > 0) {
      const equalShare = remainingAmount / numUnadjustedParticipants;
      selectedParticipantIds.value.forEach((userId) => {
        if (!participantAdjusted.value[userId]) {
          participantShares.value[userId] = parseFloat(equalShare.toFixed(2));
        }
      });
    }
  } else if (shareType.value === 'percentage') {
    let totalAdjustedPercentage = 0;
    let numUnadjustedParticipants = 0;

    selectedParticipantIds.value.forEach((userId) => {
      if (participantAdjusted.value[userId]) {
        totalAdjustedPercentage += participantShares.value[userId] || 0;
      } else {
        numUnadjustedParticipants += 1;
      }
    });

    const remainingPercentage = 100 - totalAdjustedPercentage;

    if (numUnadjustedParticipants > 0) {
      const equalPercentage = remainingPercentage / numUnadjustedParticipants;
      selectedParticipantIds.value.forEach((userId) => {
        if (!participantAdjusted.value[userId]) {
          participantShares.value[userId] = parseFloat(equalPercentage.toFixed(2));
        }
      });
    }
  }
};


const prefillShares = () => {
  participantShares.value = {};
  resetAdjustments();

  const numParticipants = selectedParticipantIds.value.length;
  if (numParticipants === 0) {
    participantShares.value = {};
    return;
  }

  if (shareType.value === 'unequal') {
    const equalShare = parseFloat((amount.value / numParticipants).toFixed(2));
    selectedParticipantIds.value.forEach((userId) => {
      participantShares.value[userId] = equalShare;
    });
  } else if (shareType.value === 'percentage') {
    const equalPercentage = parseFloat((100 / numParticipants).toFixed(2));
    selectedParticipantIds.value.forEach((userId) => {
      participantShares.value[userId] = equalPercentage;
    });
  }
};

const loadParticipants = async () => {
  const {data, error: fetchError} = await expenseService.fetchGroupParticipants(props.groupId);
  if (fetchError) {
    error.value = 'Failed to load participants.';
  } else {
    participants.value = data;
    selectedParticipantIds.value = participants.value.map((member) => member.id);
    prefillShares();
  }
};

const emptyDebt = computed(() => !amount.value || !paidBy.value || selectedParticipantIds.value.length === 0)

const expenseDebts = computed(() => {
  const debts: Debt[] = [];

  if (emptyDebt.value) {
    return debts;
  }

  const payerId = paidBy.value;

  if (shareType.value === 'equal') {
    const splitAmount = amount.value / selectedParticipantIds.value.length;
    selectedParticipantIds.value.forEach((userId) => {
      if (userId !== payerId) {
        debts.push({
          from: userId,
          to: payerId!,
          amount: parseFloat(splitAmount.toFixed(2)),
        });
      }
    });
  } else {
    selectedParticipantIds.value.forEach((userId) => {
      const share = participantShares.value[userId];
      let amountOwed = 0;
      if (shareType.value === 'unequal') {
        amountOwed = share;
      } else if (shareType.value === 'percentage') {
        amountOwed = (amount.value * share) / 100;
      }
      amountOwed = parseFloat(amountOwed.toFixed(2));
      if (userId !== payerId) {
        debts.push({
          from: userId,
          to: payerId!,
          amount: amountOwed,
        });
      }
    });
  }

  return debts;
});

const handleAddExpense = async () => {
  error.value = ''; // Reset error message

  if (!userStore.user) {
    error.value = 'You must be logged in to add an expense.';
    return;
  }

  if (selectedParticipantIds.value.length === 0) {
    error.value = 'Please select at least one participant.';
    return;
  }

  const {error: addError} = await expenseService.addExpense(props.groupId,{
    groupId: props.groupId,
    description: description.value,
    amount: amount.value,
    currency: currency.value,
    paidBy: paidBy.value!,
    shareType: shareType.value,
    date: date.value,
    note: note.value,
    participantsData: {
      selectedParticipantIds: selectedParticipantIds.value,
      participantShares: participantShares.value,
    }
  });

  if (addError) {
    error.value = 'Failed to add expense.';
  } else {
    alert('Expense added successfully!');
  }
};

onMounted(() => {
  loadParticipants();
});

watch([shareType, selectedParticipantIds], ([shareType]) => {
  if (shareType === 'equal') {
    participantShares.value = {};
  }
  resetAdjustments()
  prefillShares();
});

watch(amount, () => {
  if (shareType.value === 'unequal' && Object.keys(participantAdjusted.value).length === 0) {
    prefillShares();
  }
});
</script>

<template>
  <section class="bg-zinc-100 dark:bg-zinc-900 w-screen min-h-screen md:max-w-screen min-h-screen-xl bg-zinc-100 dark:bg-zinc-900 md:m-auto p-5">
    <div class="flex justify-between">
      <BackRouterButton :to="`/groups/${groupId}`" />
    </div>
    <h2 class="text-center text-4xl font-bold font-display my-10 text-gray-800 dark:text-zinc-400">Add New Expense</h2>
    <form @submit.prevent="handleAddExpense" class="flex flex-col gap-4 pb-5">
      <div>
        <BaseInput label="Title" type="text" v-model="description" id="description" placeholder="Eg: Breakfast in Mirn Station" name="description" required/>
      </div>
      <div class="flex gap-4">
        <div class="flex-1">
          <BaseInput label="Amount" v-model.number="amount" id="amount" type="number" step="0.01" name="amount" required/>
        </div>
        <div class="flex-1">
          <BaseSelect label="Currency" v-model="currency" id="currency" name="currency" :options="[
            { value: 'USD', label: 'USD' },
            { value: 'EUR', label: 'EUR' },
          ]" required/>
        </div>
      </div>

      <div class="flex gap-4 w-100">
        <div class="flex-1">
          <BaseSelect label="Paid by" v-model="paidBy!" id="paid-by" name="paid-by" class="rounded-xl p-5 w-full bg-gray-100 font-semibold" :options="[
            ...participants.map((participant) => ({ value: participant.id, label: participant.name })),
          ]" required />
        </div>
        <div class="flex-1">
          <BaseInput label="Date" name="date" v-model="date" id="date" type="date" required class="w-100"/>
        </div>
      </div>
      <div>
        <BaseTextarea label="Note" v-model="note" name="note" />
      </div>
      <div>
        <BaseSelect label="Share type" v-model="shareType" id="share-type" name="share-type" class="rounded-xl p-5 w-full bg-gray-100 font-semibold w-100" :options="[
          { value: 'equal', label: 'Equally' },
          { value: 'unequal', label: 'Unequally' },
          { value: 'percentage', label: 'By Percentage' },
        ]" required/>
      </div>
      <div>
        <h3 class="font-bold text-gray-800 dark:text-zinc-400 mb-2">Split With</h3>
        <div class="flex gap-2 flex-col">
          <div class="flex items-center gap-4 border-2 dark:border-zinc-700 h-16 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900" v-for="participant in participants" :key="participant.id">
            <input
                type="checkbox"
                v-model="selectedParticipantIds"
                :value="participant.id"
                @change="prefillShares"
            />
            <label class="flex-1 font-semibold text-gray-800 dark:text-zinc-400">{{ participant.name }}</label>
            <div class="w-20">
              <BaseInput
                  v-if="shareType !== 'equal'"
                  :name="`share-${participant.id}`"
                  v-model.number="participantShares[participant.id]"
                  @input="onParticipantShareChange(participant.id)"
                  :placeholder="shareType === 'percentage' ? 'Percentage' : 'Amount'"
                  type="number"
                  size="small"
                  text-color="text-gray-800 dark:text-zinc-400"
                  step="0.01"
                  class="w-full text-center border-2"
                  :disabled="!selectedParticipantIds.includes(participant.id)"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-if="expenseDebts.length > 0">
        <h3 class="font-bold text-center mb-4">Expense Summary</h3>
        <div class="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-2 flex gap-2 flex-col">
          <div v-for="debt in expenseDebts" :key="debt.from" class="flex justify-between">
            <div>
              <span class="font-bold"> {{ getUsernameFromParticipants(debt.from, participants) }}</span>
              owes
              <span class="font-bold">{{ getUsernameFromParticipants(debt.to, participants) }}</span>
            </div>
            <span class="font-bold">{{ debt.amount.toFixed(2) }} {{ currency }}</span>
          </div>
        </div>
      </div>
      <BaseButton type="submit">Add Expense</BaseButton>
    </form>
    <p v-if="error">{{ error }}</p>
  </section>
</template>
