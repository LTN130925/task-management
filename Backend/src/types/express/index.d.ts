import { IUser } from '../models/users.model';
import { IAccount } from '../models/accounts.model';
import { IRole } from '../models/roles.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      account?: IAccount;
      role?: IRole;
    }
  }
}