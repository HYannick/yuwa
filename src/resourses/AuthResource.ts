import {SupabaseClient} from '@supabase/supabase-js';

export class AuthResource {
  db: SupabaseClient;
  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async signUp(email: string, password: string) {
    return this.db.auth.signUp({
      email,
      password,
    })
  }

  async signIn(email: string, password: string) {
    const userData = await this.db.auth.signInWithPassword({
      email,
      password,
    })
    await this.db.rpc('set_current_user', { user_id: userData.data.user.id });
    return userData;
  }

  async signOut() {
    return this.db.auth.signOut()
  }

  async getAuthenticatedUser() {
    const user = await this.db.auth.getUser()
    const { error } = await this.db.rpc('set_current_user', { user_id: user.data.user.id });

    if (error) {
      console.error('Error setting session variable:', error);
    } else {
      console.log('Session variable set successfully');
    }
    return user
  }

  onAuthStateChange(callback: (event: any, session: any) => void) {
    return this.db.auth.onAuthStateChange(callback)
  }
}