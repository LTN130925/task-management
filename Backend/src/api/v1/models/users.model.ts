import mongoose from 'mongoose';

import { IUser } from '../../../interfaces/users.interface';

const userSchema = new mongoose.Schema<IUser>({
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
  deletedAt: Date,
}, {
  timestamps: true,
});

const User = mongoose.model<IUser>('User', userSchema, 'users');

export default User;
