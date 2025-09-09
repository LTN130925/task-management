import Task from '../../../../models/tasks.model';
import Account from '../../../../models/accounts.model';
import User from '../../../../models/users.model';

export interface IChart {
  userId: string;
  fullName: string;
  initial: number;
  doing: number;
  finish: number;
  pending: number;
  notFinish: number; // chưa xong nhưng chưa chắc trễ
  late: number; // trễ deadline
  completionRate?: number;
}

export const chartTask = async (): Promise<IChart[]> => {
  const stats: Record<string, IChart> = {};
  const tasks: any = await Task.find({ deleted: false }).lean();

  for (const task of tasks) {
    const userId = task.createdBy.toString();
    const getFullName = await Account.findOne({
      _id: userId,
      deleted: false,
    })
      .lean()
      .select('fullName');

    let fullName;
    if (getFullName) {
      fullName = getFullName.fullName;
    } else {
      const user = await User.findOne({ _id: userId })
        .lean()
        .select('fullName');
      fullName = user ? user.fullName : 'không tìm thấy';
    }

    if (!stats[userId]) {
      stats[userId] = {
        userId,
        fullName,
        initial: 0,
        doing: 0,
        finish: 0,
        pending: 0,
        notFinish: 0,
        late: 0,
      };
    }

    (stats[userId] as any)[task.status] += 1;

    if (
      task.status !== 'finish' &&
      task.timeFinish &&
      task.timeFinish < Date.now()
    ) {
      stats[userId].late += 1;
    }
  }

  for (const element of Object.values(stats)) {
    const total =
      element.initial +
      element.doing +
      element.finish +
      element.pending +
      element.notFinish;
    element.completionRate = total > 0 ? (element.finish / total) * 100 : 0;
  }

  return Object.values(stats);
};
