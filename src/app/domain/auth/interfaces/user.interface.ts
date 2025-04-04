import { eUserStatus } from '../enums/user-status.enum';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface iUser {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  avatar_url: string;
  status: eUserStatus;
}
