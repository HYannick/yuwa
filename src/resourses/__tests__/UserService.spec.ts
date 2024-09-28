import {AuthResource} from '@/resourses/AuthResource.ts';
import {UserService} from '@/resourses/UserService.ts';
import {UserResource} from '@/resourses/UserResource.ts';

describe('UserService', () => {
  it('should get user data', async () => {
    const authResource = {getAuthenticatedUser: vi.fn().mockResolvedValue({data: {user: {id: '123'}}})} as unknown as AuthResource;
    const userResource = {getUser: vi.fn().mockResolvedValue({data: {id: '123'}})} as unknown as UserResource;
    const userService = new UserService(authResource, userResource);
    const {data} = await userService.getUser();

    expect(authResource.getAuthenticatedUser).toHaveBeenCalled();
    expect(userResource.getUser).toHaveBeenCalledWith('123');
    expect(data).toEqual({id: '123'});

  });
});