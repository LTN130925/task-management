import { getValueSystem } from '../../../../helpers/getProgressSystem';

export const systemProgress = async () => {
  const total = await getValueSystem.totalTask();
  const initial = await getValueSystem.totalTaskInitial();
  const doing = await getValueSystem.totalTaskDoing();
  const finish = await getValueSystem.totalTaskFinish();
  const pending = await getValueSystem.totalTaskPending();
  const notFinish = await getValueSystem.totalTaskNotFinish();
  const completionRate =
    (finish / (initial + finish + pending + doing + notFinish)) * 100;

  return {
    total,
    initial,
    doing,
    finish,
    pending,
    notFinish,
    completionRate,
  };
};
