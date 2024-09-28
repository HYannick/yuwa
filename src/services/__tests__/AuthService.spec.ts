import {AuthService} from '@/services/AuthService.ts';
import {UserResource} from '@/resourses/UserResource.ts';
import {AuthResource} from '@/resourses/AuthResource.ts';

describe('AuthService', () => {
  it('should sign up and create a user', async () => {
    const signUp = vi.fn().mockResolvedValue({data: {user: {id: '123'}}});
    const createUser = vi.fn();
    const authResource = { signUp } as unknown as AuthResource;
    const userResource = { createUser } as unknown as UserResource;
    const authService = new AuthService(authResource, userResource);
    const email = 'kortega@gmail.com';
    const password = 'password';
    const username = 'Kristin';

    await authService.signUp(username, email, password);
    expect(signUp).toHaveBeenCalledWith(email, password);
    expect(createUser).toHaveBeenCalledWith('123', username);
  });

  it('should sign in a new user', async () => {
    const signIn = vi.fn().mockResolvedValue({data: {user: {id: '123'}}});
    const getUser = vi.fn().mockResolvedValue({data: {id: '123'}});
    const authResource = { signIn } as unknown as AuthResource;
    const userResource = { getUser } as unknown as UserResource;
    const authService = new AuthService(authResource, userResource);
    const email = 'kortega@gmail.com';
    const password = 'password';

    await authService.signIn(email, password);
    expect(signIn).toHaveBeenCalledWith(email, password);
    expect(getUser).toHaveBeenCalledWith('123');
  });

  it('should watch auth state change', () => {
    const authResource = { onAuthStateChange: vi.fn() } as unknown as AuthResource;
    const userResource = { getUser: vi.fn() } as unknown as UserResource;
    const authService = new AuthService(authResource, userResource, {} as any);
    authService.watchAuthStateChange(vi.fn());
    expect(authResource.onAuthStateChange).toHaveBeenCalled();
  });
});