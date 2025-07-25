import mongoose from 'mongoose';

import { generateRandom } from '../../../helpers/generateRandom';

const forgotPasswordSchema = new mongoose.Schema({
  email: String,
  otp: {
    type: String,
    default: generateRandom.typeNumber(8) as string,
  },
  expireAt: {
    type: Date,
    default: Date.now,
  },
});

forgotPasswordSchema.index({ expireAt: 1 }, { expireAfterSeconds: 60 * 2 });

const ForgotPassword = mongoose.model('ForgotPassword', forgotPasswordSchema, 'forgot-passwords');

export default ForgotPassword;