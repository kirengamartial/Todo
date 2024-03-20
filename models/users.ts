import mongoose, { Document, Schema } from "mongoose";

interface User extends Document {
    username: string,
    email: string,
    password: string
}

const userSchema = new Schema ({
    username: String,
    email: String,
    password: String
})

export default mongoose.model<User>('User', userSchema)