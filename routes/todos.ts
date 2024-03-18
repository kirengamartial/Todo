import express, { Request, Response } from 'express';
import TodoModel, { Todo } from '../models/todo';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const todos = await TodoModel.find();
    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, completed } = req.body;
    const todo = new TodoModel({ title, completed }); 
    await todo.save(); 
    res.status(201).json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
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

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await TodoModel.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
