import Task from '../models/tasks.model';

export const getValueSystem = {
  totalTask: async () => {
    const totalTask = await Task.countDocuments();
    return totalTask;
  },

  totalTaskFinish: async () => {
    const totalTaskFinish = await Task.countDocuments({ status: 'finish' });
    return totalTaskFinish;
  },

  totalTaskNotFinish: async () => {
    const totalTaskNotFinish = await Task.countDocuments({
      status: 'notFinish',
    });
    return totalTaskNotFinish;
  },

  totalTaskPending: async () => {
    const totalTaskPending = await Task.countDocuments({ status: 'pending' });
    return totalTaskPending;
  },

  totalTaskDoing: async () => {
    const totalTaskDoing = await Task.countDocuments({ status: 'doing' });
    return totalTaskDoing;
  },

  totalTaskInitial: async () => {
    const totalTaskInitial = await Task.countDocuments({ status: 'initial' });
    return totalTaskInitial;
  },
};
