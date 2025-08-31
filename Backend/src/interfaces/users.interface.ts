import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  avatar: string;
  status: string;
  deleted: boolean;
  createdBy: {
    admin_id: string;
    user_id: string;
    createdAt: Date;
  }
  updatedBy: {
    title: string;
    admin_id: string;
    user_id: string;
    updatedAt: Date;
  }[];
  deletedBy: {
    admin_id: string;
    user_id: string;
    deletedAt: Date;
  };
}
