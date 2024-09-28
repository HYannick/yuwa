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
    return this.db.auth.signInWithPassword({
      email,
      password,
    })
  }

  async signOut() {
    return this.db.auth.signOut()
  }

  async getAuthenticatedUser() {
    return this.db.auth.getUser()
  }

  onAuthStateChange(callback: (event: any, session: any) => void) {
    return this.db.auth.onAuthStateChange(callback)
  }
}