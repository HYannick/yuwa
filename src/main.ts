import {createApp} from 'vue'
import './style.css'
import App from './App.vue'

import { createClient } from '@supabase/supabase-js'
import {AuthService} from './services/AuthService.ts';
import router from './router';
import {createPinia} from 'pinia';
import {GroupService} from './services/GroupService.ts';
import {ExpenseService} from './services/ExpenseService.ts';
import {SettlementService} from './services/SettlementService.ts';
import {GroupResource} from '@/resourses/GroupResource.ts';
import {UserResource} from '@/resourses/UserResource.ts';
import {AuthResource} from '@/resourses/AuthResource.ts';
import {UserService} from '@/resourses/UserService.ts';
import {ExpenseResource} from '@/resourses/ExpenseResource.ts';

const pinia = createPinia();
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)

const userResource = new UserResource(supabase);
const authResource = new AuthResource(supabase);
const groupResource = new GroupResource(supabase);
const expenseResource = new ExpenseResource(supabase);
const userService = new UserService(authResource, userResource);
const authService =  new AuthService(authResource, userResource);
const groupService = new GroupService(supabase, groupResource, authService);
const expenseService = new ExpenseService(supabase, expenseResource);
const settlementService = new SettlementService(supabase);

createApp(App).use(router)
  .use(pinia)
  .provide('supabaseClient', supabase)
  .provide('authService', authService)
  .provide('expenseService', expenseService)
  .provide('groupService', groupService)
  .provide('settlementService', settlementService)
  .provide('userService', userService)
  .mount('#app')

