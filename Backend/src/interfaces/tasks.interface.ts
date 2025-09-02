import mongoose from 'mongoose';

export interface ITask extends mongoose.Document {
  title: string;
  status: string;
  content: string;
  createdBy: string;
  taskParentId: string;
  listUsers: string[];
  timeStart: Date;
  timeFinish: Date;
  deleted: boolean;
  deletedAt: Date;
}
