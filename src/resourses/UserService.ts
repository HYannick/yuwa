import {AuthResource} from '@/resourses/AuthResource.ts';
import {UserResource} from '@/resourses/UserResource.ts';

export class UserService {
  authResource: AuthResource;
  userResource: UserResource;

  constructor(authResource: AuthResource, userResource: UserResource) {
    this.authResource = authResource;
    this.userResource = userResource;
  }

  async getUser() {
    const {data: {user}} = await this.authResource.getAuthenticatedUser();
    return this.userResource.getUser(user.id);
  }
}