import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
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
});

const User = mongoose.model('User', userSchema, 'users');

export default User;
