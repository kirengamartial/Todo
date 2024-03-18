import express from 'express';
import mongoose from 'mongoose';
import todosRouter from '../routes/todos';



mongoose.connect('mongodb+srv://test1234:test1234@cluster0.v9lpw.mongodb.net/ToDoApp')
.then(() => {
  const app = express()
  app.use(express.json())
  app.use('/todos', todosRouter)
  app.listen(3000, () => console.log('connected to database successfully'))
})
.catch((error) => console.log(error) )
