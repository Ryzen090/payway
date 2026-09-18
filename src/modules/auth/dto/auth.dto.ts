import { AuthUser } from '../../../model/auth';

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}
