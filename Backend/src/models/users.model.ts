import mongoose from 'mongoose';

import { IUser } from '../interfaces/users.interface';

const userSchema = new mongoose.Schema<IUser>(
  {
    fullName: String,
    email: String,
    password: String,
    phone: String,
    avatar: String,
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      admin_id: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    updatedBy: [
      {
        title: String,
        admin_id: String,
        updatedAt: Date,
      },
    ],
    deletedBy: {
      admin_id: String,
      deletedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>('User', userSchema, 'users');

export default User;
