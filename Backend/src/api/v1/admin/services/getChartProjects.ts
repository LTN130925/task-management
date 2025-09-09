import Project from '../../../../models/projects.model';
import Task from '../../../../models/tasks.model';

export interface IProjectChart {
  projectId: string;
  title: string;
  total: number;
  onTime: number;
  late: number;
  overdue: number;
  inProgress: number;
  completionRate: number;
}

export const getChartProjects = async (): Promise<IProjectChart[]> => {
  const projects: any = await Project.find({
    deleted: false,
  }).lean();

  const stats: IProjectChart[] = [];

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
        if (task.timeFinish && task.timeFinish < new Date()) {
          overdue++;
        } else {
          inProgress++;
        }
      }
    }

    stats.push({
      projectId: project._id.toString(),
      title: project.title,
      total: tasks.length,
      onTime,
      late,
      overdue,
      inProgress,
      completionRate: tasks.length === 0 ? 0 : (onTime / tasks.length) * 100,
    });
  }

  return stats;
};
