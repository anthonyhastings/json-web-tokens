import mongoose from 'mongoose';

export default mongoose.model(
  'User',
  new mongoose.Schema({
    username: String,
    password: String,
    admin: Boolean
  })
);
