import Task from '../../../../models/tasks.model';

export interface IProgress {
  userId: string;
  initial: number;
  doing: number;
  finish: number;
  pending: number;
  notFinish: number;
  completionRate?: number;
  createdBy?: {
    fullName: string;
    role?: string;
    phone?: string;
    email?: string;
  };
}

export const getProgress = async (
  condition?: any,
  sort?: any,
  pagination?: any
): Promise<IProgress[]> => {
  const tasks = await Task.find(condition || { deleted: false })
    .lean()
    .sort(sort || { createdAt: -1 })
    .skip(pagination.skip || 0)
    .limit(pagination.limit || 0);
  const stats: Record<string, IProgress> = {};

  for (const task of tasks) {
    const userId = task.createdBy.toString();
    if (!stats[userId]) {
      stats[userId] = {
        userId,
        initial: 0,
        doing: 0,
        finish: 0,
        pending: 0,
        notFinish: 0,
      };
    }

    (stats[userId] as any)[task.status] += 1;

    if (
      task.status !== 'finish' &&
      task.timeFinish &&
      task.timeFinish < new Date()
    ) {
      stats[userId].notFinish += 1;
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
  }

  return Object.values(stats);
};
