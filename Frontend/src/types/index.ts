export type TaskStatus = 'initial' | 'doing' | 'finish' | 'pending' | 'notFinish';

export interface Task {
  _id: string;
  title: string;
  status: TaskStatus;
  content?: string;
  timeStart?: string;
  timeFinish?: string;
  deleted?: boolean;
  listUsers?: string[];
}

export interface PaginationInfo {
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
