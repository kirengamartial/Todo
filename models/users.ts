import mongoose, { Document, Schema } from 'mongoose';
import { isEmail } from 'validator';
import bcrypt from 'bcrypt';


export interface User extends Document {
  username: string;
  email: string;
  password: string;
  login(email: string, password: string): Promise<User>
}

const userSchema = new Schema({
  username: { 
    type: String, 
    required: [true, 'please enter a username'] 
  },
  email: { 
    type: String, 
    required: [true, 'please enter an email'],
    unique: true, 
    lowercase: true,
    validate: [isEmail, 'please enter a valid email' ]
  },
  password: { 
    type: String, 
    required: [true, 'please enter a password'],
    minlength: [6, 'Minimum password is 6 characters'] 
  },
});

// // this mongoose hook is a function which is fired after a mongoose event

// // fire a function after doc saved to db
// userSchema.post('save', function(doc, next) {
// console.log('new user was created & saved', doc)
// next()
// })
// // fire a function before doc is saved to db
// // we can't use the arrow function because we want the instance of the user before it is saved to db and we access it by using this keyword
// userSchema.pre('save', function(next) {
//   console.log('user about to be created and saved', this)
// next()
// })


userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt()
  this.password = await bcrypt.hash(this.password, salt)
  next()
})
// static method to login user 
// userSchema.statics.login = async function (email, password) {
//   const user = await this.findOne({email})
//   if(user) {
//   const auth =  await bcrypt.compare(password, user.password)
//   if(auth) {
//     return user
//   }
//   throw Error('incorrect password')
//   }
//   throw Error('incorrect email')
// }

const UserModel = mongoose.model<User>('User', userSchema);

export default UserModel;
