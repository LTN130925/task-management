import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  avatar: string;
  status: string;
  deleted: boolean;
  deletedAt: Date;
}