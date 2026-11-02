import { Role } from './role.model';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: Role;
}
