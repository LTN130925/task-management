import { IUser } from '../models/users.model';
import { IAccount } from '../models/accounts.model';
import { IRole } from '../models/roles.model';
import { ITask } from '../../interfaces/tasks.interface';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      account?: IAccount;
      role?: IRole;
      task?: ITask;
    }
  }
}
