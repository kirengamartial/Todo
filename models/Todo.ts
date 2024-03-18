import mongoose, { Document, Schema } from 'mongoose';

export interface Todo extends Document {
  title: string;
  completed: boolean;
}

const todoSchema = new Schema({
  title: String,
  completed: Boolean,
});

export default mongoose.model<Todo>('Todo', todoSchema);
