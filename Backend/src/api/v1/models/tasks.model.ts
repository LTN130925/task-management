import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
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
      type: Array,
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

const Task = mongoose.model('Task', taskSchema, 'tasks');

export default Task;
