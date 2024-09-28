import {SupabaseClient} from '@supabase/supabase-js';

export class UserResource {
  db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async createUser(userId: string, username: string) {
    await this.db.from('users')
      .insert([{auth_id: userId, name: username}])
  }

  async getUser(authId: string) {
    return this.db.from('users')
      .select('*')
      .eq('auth_id', authId).single()
  }
}