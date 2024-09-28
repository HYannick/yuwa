import {AuthResource} from '@/resourses/AuthResource.ts';
import {UserResource} from '@/resourses/UserResource.ts';
import {Pinia} from 'pinia';

export class AuthService {
  authResource: AuthResource;
  userResource: UserResource;

  constructor(authResource: AuthResource, userResource: UserResource) {
    this.authResource = authResource;
    this.userResource = userResource
  }

  async signUp(username: string, email: string, password: string) {
    const {data: userData, error} = await this.authResource.signUp(email, password)

    await this.userResource.createUser(userData?.user?.id, username)

    return {userData, error}
  }

  async signIn(email: string, password: string) {
    const {data: userData, error} = await this.authResource.signIn(email, password)

    const {data} = await this.userResource.getUser(userData.user?.id)
    return {data, error}
  }

  async signOut() {
    const {error} = await this.authResource.signOut()
    return {error}
  }

  async getAuthenticatedUser() {
    const {data} = await this.authResource.getAuthenticatedUser()
    console.log(this.pinia.state.value);
    return data;
  }


  watchAuthStateChange(cb: (event: any, session: any) => void) {
    return this.authResource.onAuthStateChange(cb)
  }
}
