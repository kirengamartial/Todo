import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import TodoModel, { Todo } from '../models/todo';

const app = express()
app.use(express.json())

mongoose.connect('mongodb+srv://test1234:test1234@cluster0.v9lpw.mongodb.net/ToDoApp')
.then(() => {
   console.log('database connected')
})
.catch((error) => console.log(error) )

app.get('/', async (_req: Request, res: Response) => {
    try {
      const todos = await TodoModel.find();
      res.status(200).json(todos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  app.post('/', async (req: Request, res: Response) => {
    try {
      const { title, completed } = req.body;
      if (!completed || !title) {
        return res.status(400).json({ message: 'Missing or invalid "completed" field or "title" field' });
      }
      const todo = new TodoModel({ title, completed });
      await todo.save(); 
      res.status(200).json(todo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
});


app.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, completed } = req.body;
  
      const todo = await TodoModel.findById(id);
  
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
  
      todo.title = title || todo.title;
      todo.completed = completed ?? todo.completed;
      await todo.save();
  
      res.json(todo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

 app.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await TodoModel.findByIdAndDelete(id);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });


  
export default app