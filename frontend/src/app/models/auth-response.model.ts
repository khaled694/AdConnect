import { Role } from './role.model';

export interface AuthResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  role: Role | string;
}
