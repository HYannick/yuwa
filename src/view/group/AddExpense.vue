<script lang="ts" setup>
import {ref, onMounted, inject, watch, computed} from 'vue';
import {useUserStore} from '@/stores/userStore.ts';
import {ExpenseService} from '@/services/ExpenseService.ts';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseSelect from '@/components/BaseSelect.vue';
import {getUsernameFromParticipants} from '@/utils/common.utils.ts';
import {GroupParticipant} from '@/domain/GroupParticipant.ts';
import BackButton from '@/components/BackButton.vue';

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
  id: string;
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
    // Sum of manually adjusted shares
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
    // Sum of manually adjusted percentages
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
  const {data, error: fetchError} = await expenseService.fetchGroupParticipants(props.id);
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

  let participantData = [];

  if (shareType.value === 'equal') {
    const splitAmount = amount.value / selectedParticipantIds.value.length;
    participantData = selectedParticipantIds.value.map((userId) => ({
      user_id: userId,
      share_value: null,
      amount_owed: parseFloat(splitAmount.toFixed(2)),
      note: '',
    }));
  } else {
    let totalAdjusted = 0;
    selectedParticipantIds.value.forEach((userId) => {
      const share = participantShares.value[userId];
      if (share === undefined || share === null || isNaN(share)) {
        error.value = 'Please enter share values for all selected participants.';
        return;
      }
      totalAdjusted += share;
    });

    if (shareType.value === 'unequal' && Math.abs(totalAdjusted - amount.value) > 0.01) {
      error.value = 'Total amount must equal the expense amount.';
      return;
    }

    if (shareType.value === 'percentage' && Math.abs(totalAdjusted - 100) > 0.01) {
      error.value = 'Total percentage must equal 100%.';
      return;
    }

    participantData = selectedParticipantIds.value.map((userId) => {
      const share = participantShares.value[userId];
      let amountOwed = 0;
      if (shareType.value === 'unequal') {
        amountOwed = share;
      } else if (shareType.value === 'percentage') {
        amountOwed = (amount.value * share) / 100;
      }
      return {
        user_id: userId,
        share_value: share,
        amount_owed: parseFloat(amountOwed.toFixed(2)),
        note: '',
      };
    });
  }

  const {error: addError} = await expenseService.addExpense({
    groupId: props.id,
    description: description.value,
    amount: amount.value,
    currency: currency.value,
    paidBy: paidBy.value!,
    shareType: shareType.value,
    date: date.value,
    note: note.value,
    participants: participantData,
  });

  if (addError) {
    error.value = 'Failed to add expense.';
  } else {
    // Reset form or navigate to group page
    alert('Expense added successfully!');
    // Optionally reset form fields or navigate
  }
};

onMounted(() => {
  loadParticipants();
});


// Watch for changes in shareType and prefill shares accordingly
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
  <section class="w-screen md:max-w-screen-xl md:m-auto p-5 h-screen">
    <div class="flex justify-between">
      <BackButton :to="`/groups/${id}`" />
    </div>
    <h2 class="text-center text-4xl font-bold my-10">Add New Expense</h2>
    <form @submit.prevent="handleAddExpense" class="flex flex-col gap-4">
      <div>
        <label for="description" class="font-bold">Title</label>
        <BaseInput type="text" v-model="description" id="description" placeholder="Eg: Breakfast in Mirn Station" name="description" required/>
      </div>
      <div class="flex gap-4">
        <div>
          <label for="amount" class="font-bold">Amount</label>
          <BaseInput v-model.number="amount" id="amount" type="number" step="0.01" name="amount" required/>
        </div>

        <div class="flex-1">
          <label for="currency" class="font-bold">Currency</label>
          <BaseSelect v-model="currency" id="currency" name="currency" :options="[
            { value: 'USD', label: 'USD' },
            { value: 'EUR', label: 'EUR' },
          ]" required/>
        </div>
      </div>

      <div class="flex gap-4 w-100">
        <div class="flex-1">
          <label for="paid-by" class="font-bold">Paid By</label>
          <BaseSelect v-model="paidBy!" id="paid-by" name="paid-by" class="rounded-xl p-5 w-full bg-gray-100 font-semibold" :options="[
            ...participants.map((participant) => ({ value: participant.id, label: participant.name })),
          ]" required />
        </div>
        <div class="flex-1">
          <label for="date" class="font-bold">Date</label>
          <BaseInput name="date" v-model="date" id="date" type="date" required class="w-100"/>
        </div>
      </div>
      <div>
        <label for="paid-by" class="font-bold">Note</label>
        <textarea v-model="note" class="rounded-xl p-5 w-full bg-gray-100 font-semibold" placeholder="Eg: Amazing trip to Antares"
                  id="note"></textarea>
      </div>
      <!-- Share Type -->
      <div>
        <label for="share-type" class="font-bold">Share Type</label>
        <BaseSelect v-model="shareType" id="share-type" name="share-type" class="rounded-xl p-5 w-full bg-gray-100 font-semibold w-100" :options="[
          { value: 'equal', label: 'Equally' },
          { value: 'unequal', label: 'Unequally' },
          { value: 'percentage', label: 'By Percentage' },
        ]" required/>
      </div>
      <div>
        <h3 class="font-bold">Split With</h3>
        <div class="flex gap-2 flex-col">
          <div class="flex items-center gap-4 border-2 h-16 px-4 rounded-xl" v-for="participant in participants" :key="participant.id">
            <input
                type="checkbox"
                v-model="selectedParticipantIds"
                :value="participant.id"
                @change="prefillShares"
            />
            <label class="flex-1 font-semibold">{{ participant.name }}</label>
            <div>
              <BaseInput
                  v-if="shareType !== 'equal'"
                  :name="`share-${participant.id}`"
                  v-model.number="participantShares[participant.id]"
                  @input="onParticipantShareChange(participant.id)"
                  :placeholder="shareType === 'percentage' ? 'Percentage' : 'Amount'"
                  type="number"
                  size="p-1"
                  color="bg-indigo-500"
                  text-color="text-white"
                  step="0.01"
                  class="w-12 text-center"
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
