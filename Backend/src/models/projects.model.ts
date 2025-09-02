import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    deadline: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
    members: {
      type: [String],
      default: [],
    },
    createdBy: {
      createdById: String,
      role: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      required: true,
    },
    updatedBy: [
      {
        updatedById: String,
        role: String,
        updatedAt: Date,
      },
    ],
    deletedBy: {
      deletedById: String,
      role: String,
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
