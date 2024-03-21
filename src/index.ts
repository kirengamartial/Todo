import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import TodoModel, { Todo } from '../models/Todo';
import UserModel from '../models/users';


const app = express();
app.use(express.json());

mongoose.connect('mongodb+srv://test1234:test1234@cluster0.v9lpw.mongodb.net/ToDoApp')
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((error) => console.log(error));

// Todo routes
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

// Users routes
app.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/users', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const newUser = new UserModel({ username, email,  password });
    await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.password = password || user.password;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await UserModel.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default app;
