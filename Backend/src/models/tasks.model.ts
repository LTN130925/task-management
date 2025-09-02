import mongoose from 'mongoose';

import { ITask } from '../interfaces/tasks.interface';

const taskSchema = new mongoose.Schema<ITask>(
  {
    title: String,
    status: {
      type: String,
      enum: ['initial', 'doing', 'finish', 'pending', 'notFinish'],
      default: 'initial',
    },
    content: String,
    createdBy: String,
    taskParentId: String,
    listUsers: {
      type: [String],
      default: [],
    },
    timeStart: Date,
    timeFinish: Date,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model<ITask>('Task', taskSchema, 'tasks');

export default Task;
