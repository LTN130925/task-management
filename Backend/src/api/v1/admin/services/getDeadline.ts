import Task from '../../../../models/tasks.model';

export const getDeadline = async () => {
  const tasks: any = await Task.find({
    deleted: false,
  }).lean();

  let onTime = 0;
  let late = 0;
  let overdue = 0;
  let inProgress = 0;
  for (const task of tasks) {
    if (task.status === 'finish') {
      if (task.updatedAt <= task.timeFinish) {
        onTime += 1;
      } else {
        late += 1;
      }
    } else {
      if (task.timeFinish && task.timeFinish < new Date()) {
        overdue += 1;
      } else {
        inProgress += 1;
      }
    }
  }

  return {
    onTime,
    late,
    overdue,
    inProgress,
  };
};
