import Task from '../../../../models/tasks.model';
import Project from '../../../../models/projects.model';

export interface IProjectProgress {
  projectId: string;
  title: string;
  total: number;
  onTime: number;
  late: number;
  overdue: number;
  inProgress: number;
  completionRate: number;
}

export const projectsProgress = async (
  condition: any = {},
  sort: any = { createdAt: -1 },
  pagination: any = { skip: 0, limit: 100 }
): Promise<IProjectProgress[]> => {
  const projects: any = await Project.find({ deleted: false, ...condition })
    .lean()
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit);

  const stats: IProjectProgress[] = [];

  for (const project of projects) {
    const tasks = await Task.find({
      projectId: project._id.toString(),
      deleted: false,
    }).lean();

    let onTime = 0;
    let late = 0;
    let overdue = 0;
    let inProgress = 0;

    for (const task of tasks) {
      if (task.status === 'finish') {
        if (task.timeFinish && task.timeFinish <= project.deadline) {
          onTime++;
        } else {
          late++;
        }
      } else {
        if (project.deadline && project.deadline < new Date()) {
          overdue++;
        } else {
          inProgress++;
        }
      }
    }

    const total = tasks.length;
    const completionRate = total > 0 ? (onTime / total) * 100 : 0;

    stats.push({
      projectId: project._id.toString(),
      title: project.title,
      total,
      onTime,
      late,
      overdue,
      inProgress,
      completionRate,
    });
  }

  return stats;
};
