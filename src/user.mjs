import mongoose from 'mongoose';

export default mongoose.model(
  'User',
  new mongoose.Schema(
    {
      username: String,
      password: String,
      admin: Boolean
    },
    {
      toJSON: {
        transform: (doc, ret) => {
          delete ret.password;
          delete ret.__v;
          return ret;
        }
      }
    }
  )
);
