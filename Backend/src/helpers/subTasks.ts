import Task from '../models/tasks.model';

export const getSubTask = async (id: string) => {
  const getSubTask = async (parentId: string) => {
    const tasks = await Task.find({
      taskParentId: parentId,
      deleted: false,
    }).lean();

    const results = [];
    for (const task of tasks) {
      const childs: any = await getSubTask(task._id.toString());
      results.push({
        ...task,
        childs,
      });
    }

    return results;
  };

  const task = await getSubTask(id);
  return task;
};
