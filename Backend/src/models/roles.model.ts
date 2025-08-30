import mongoose from 'mongoose';

import { IRole } from '../interfaces/roles.interface';

const roleSchema = new mongoose.Schema<IRole>({
  title: String,
  description: String,
  permissions: {
    type: [String],
    default: [],
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    account_id: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  updatedBy: [
    {
      account_id: String,
      title: String,
      updatedAt: Date,
    },
  ],
  deletedBy: {
    account_id: String,
    deletedAt: Date,
  },
});

const Role = mongoose.model<IRole>('Role', roleSchema, 'roles');

export default Role;
