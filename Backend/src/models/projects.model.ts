import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    deadline: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
      }, // 1 month
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived', 'inactive'],
      default: 'active',
    },
    members: {
      type: [String],
      default: [],
    },
    createdBy: {
      createdById: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    updatedBy: [
      {
        updatedById: String,
        updatedAt: Date,
      },
    ],
    deletedBy: {
      deletedById: String,
      deletedAt: Date,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema, 'projects');

export default Project;
