// src/store/userStore.ts
import {defineStore} from 'pinia'
import {ref} from 'vue'
import {Group} from '@/domain/Group.ts';

export const useGroupStore = defineStore('groups', () => {
  const groups = ref<Group[]>([])
  const currentGroup = ref<Group | null>(null)

  const setGroups = (fetchedGroups: Group[]) => {
    groups.value = fetchedGroups
  }

  const setCurrentGroup = (group: Group) => {
    currentGroup.value = group
  }

  const resetCurrentGroup = () => {
    currentGroup.value= null
  }

  return {
    groups,
    currentGroup,
    setGroups,
    setCurrentGroup,
    resetCurrentGroup,
  }
})
