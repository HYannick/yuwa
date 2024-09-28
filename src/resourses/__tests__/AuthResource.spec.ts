import {AuthResource} from '@/resourses/AuthResource.ts';
import {SupabaseClient} from '@supabase/supabase-js';

describe('AuthResource', () => {
  it('should sign up a new user', () => {
    const signUp = vi.fn();
    const db = {auth: {signUp}} as unknown as SupabaseClient;
    const authResource = new AuthResource(db);
    const email = 'kortega@gmail.com';
    const password = 'password';
    authResource.signUp(email, password);
    expect(signUp).toHaveBeenCalledWith({email, password});
  });

  it('should sign in a user', () => {
    const signIn = vi.fn();
    const db = {auth: {signInWithPassword: signIn}} as unknown as SupabaseClient;
    const authResource = new AuthResource(db);
    const email = 'kortega@gmail.com';
    const password = 'password';
    authResource.signIn(email, password);
    expect(signIn).toHaveBeenCalledWith({email, password});
  });

  it('should sign out a user', () => {
    const signOut = vi.fn();
    const db = {auth: {signOut}} as unknown as SupabaseClient;
    const authResource = new AuthResource(db);
    authResource.signOut();
    expect(signOut).toHaveBeenCalled();
  });

  it('should get authenticated user', () => {
    const getUser = vi.fn();
    const db = {auth: {getUser}} as unknown as SupabaseClient;
    const authResource = new AuthResource(db);
    authResource.getAuthenticatedUser();
    expect(getUser).toHaveBeenCalled();
  });

  it('should watch state change', () => {
    const onAuthStateChange = vi.fn();
    const db = {auth: {onAuthStateChange}} as unknown as SupabaseClient;
    const authResource = new AuthResource(db);
    const callback = () => {};
    authResource.onAuthStateChange(callback);
    expect(onAuthStateChange).toHaveBeenCalledWith(callback);
  });
});