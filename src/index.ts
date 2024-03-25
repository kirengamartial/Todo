import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import TodoModel, { Todo } from '../models/Todo';
import UserModel from '../models/users';
import swaggerjsdoc from 'swagger-jsdoc';
import swaggerui from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import Jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { requireAuth, preventLoggedInUserAccess } from '../middleware/authMiddleware';
import dotenv from 'dotenv'

dotenv.config()


const app = express();
app.use(express.json());
app.use(cookieParser())

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "toods api doc",
      version: "0.1",
      description: "this is a simple todo api application made with express and documented with swagger",
      contact: {
        name: "Martial kirenga",
        url: 'me.com',
        email: "info@gmail.com"
      }
    },
    servers: [
      {
        url: "http://localhost:3000/"
      }
    ],
    components: {
      schemas: {
        Todo: {
          type: "object",
          properties: {
            title: {
              type: "string"
            },
            completed: {
              type: "boolean"
            }
          },
          required: ["title", "completed"]
        },
        Users: {
          type: "object",
          properties: {
            username: {
              type: "string"
            },
            email: {
              type: "string"
            },
            password: {
              type: "string"
            }
          },
          required: ["username", "email", "password"]
        }
      }
    }
  },
  apis: ["./dist/src/*.js"]
};

const mongodbUri: string = process.env.MONGODB_URI!;
const jwtSecret = process.env.JWT_SECRET!;
mongoose.connect(mongodbUri)
  .then(() => {
    const spacs = swaggerjsdoc(options)
    app.use(
      '/api-docs',
      swaggerui.serve,
      swaggerui.setup(spacs)

    )
    console.log('Database connected successfully');
  })
  .catch((error) => console.log(error));

// Todo routes

/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: Todo management endpoints
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Retrieve all todos
 *     description: Retrieve a list of all todos
 *     responses:
 *       200:
 *         description: A list of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 */
app.get('/',requireAuth, async (_req: Request, res: Response) => {
  try {
    const todos = await TodoModel.find();
    res.status(200).json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new todo
 *     description: Create a new todo with the provided title and completed status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     responses:
 *       200:
 *         description: The created todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 */

app.post('/',requireAuth, async (req: Request, res: Response) => {
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

/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update a todo
 *     description: Update the title and/or completed status of a todo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the todo to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     responses:
 *       200:
 *         description: The updated todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 */

app.put('/:id',requireAuth, async (req: Request, res: Response) => {
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
    res.status(200).json(todo)

    res.json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a todo
 *     description: Delete a todo by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the todo to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Todo deleted successfully
 */

app.delete('/:id',requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedTodo = await TodoModel.findByIdAndDelete(id);
    if (!deletedTodo) {
      res.status(404).json({ message: 'Todo not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});




/**
 * @swagger
 * tags:
 *   name: Users
 *   description: users management endpoints
 * 
 * @swagger
 * /users:
 *   get:
 *     summary: a list of users displayed
 *     description: retrieve a list of users
 *     responses:
 *       200:
 *         description: a list of users
 *         content:
 *            application/json:
 *              schema:
 *                 type: array
 *                 items:
 *                    $ref: "#/components/schemas/Users"
 */

// Users routes
app.get('/users',requireAuth, async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

const handleErros = (err: any) => {
  console.log(err.message, err.code)
  let errorx = {username: '', email: '', password: ''}
 if(err.code === 11000) {
  errorx['email'] = 'Email already exists'
 }

  if(err.message.includes('User validation failed')){
    // console.log(Object.values(err.errors))
    Object.values(err.errors).forEach((errory: any) => {
      console.log(errory.properties)
      const path = errory.properties.path as keyof typeof errorx;
      errorx[path] = errory.properties.message
    })
  }
  return errorx
  }

  const maxAge = 3 * 24 * 60 * 60
  const createToken = (id: any) => {
   return Jwt.sign({ id }, jwtSecret, {
    expiresIn: maxAge
   })
  }


/**
 * @swagger
 * /users:
 *   post:
 *     summary: create a new user
 *     description: post a new user in the database
 *     requestBody:
 *       required: true
 *       content:
 *           application/json:
 *              schema:
 *                $ref: "#/components/schemas/Users"
 *     responses:
 *       200:
 *         description: created user
 *         content:
 *            application/json:
 *              schema:
 *                  $ref: "#/components/schemas/Users"
 */
app.post('/users',preventLoggedInUserAccess, async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new UserModel({ username, email,  password });
    await newUser.save();
    const token = createToken(newUser._id)
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000})
    res.status(200).json({user: newUser._id});
  } catch (error: any) {
    const errors = handleErros(error)
    res.status(500).json({errors});
  }
});



/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user credentials and generate JWT token for login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Users'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: string
 *                   description: ID of the logged-in user
 *       400:
 *         description: Invalid email or password
 */
app.post('/users/login',preventLoggedInUserAccess, async(req: Request, res: Response) => {
  const { username, email, password } = req.body
  try {
    const user = await UserModel.findOne({email})
    if(user) {
    const auth =  await bcrypt.compare(password, user.password)
    if(auth) {
      const token = createToken(user._id)
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000})
      return res.status(200).json({user: user._id})
    }
     res.status(400).json({message: "incorrect password"})
    }
    res.status(400).json({message: "incorrect email"})
  } catch (error) {
   res.status(500).json(error)
  }
})


/**
 * @swagger
 * /users/logout:
 *   get:
 *     summary: Logout user
 *     description: Clear JWT token from cookies to log out the user.
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Message indicating successful logout
 */

app.get('/users/logout',requireAuth, (req: Request, res: Response) => {
  res.cookie('jwt', '', {maxAge: 1})
  res.status(200).json('user is logout')
})


/**
 * @swagger
 * /users/{id}:
 *   put:
 *    summary: update a user
 *    description: update a user with an id
 *    parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to edit
 *         schema:
 *           type: string
 *    requestBody:
 *      required: true
 *      content: 
 *        application/json:
 *          schema:
 *            $ref: "#/components/schemas/Users"
 *    responses:
 *      200:
 *        description: updated user
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Users"
 * 
 */
app.put('/users/:id',requireAuth, async (req: Request, res: Response) => {
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

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *    summary: Delete a user
 *    description: delete a user with an id
 *    parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to delete
 *         schema:
 *           type: string
 *    responses:
 *      400:
 *        description: user deleted successfully
 * 
 */
app.delete('/users/:id',requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user =  await UserModel.findByIdAndDelete(id);
    if(!user) {
     return res.status(404).json({message: 'User not found'})
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// app.get('/set-cookies',(req: Request, res: Response) => {

//   res.cookie('newUser', false)
//   res.cookie('isEmployee', true, { maxAge: 1000 * 60})
//   res.send('you got the cookies')
// })
// app.get('/read-cookies', (req: Request, res: Response) => {
//   const cookies = req.cookies
//   console.log(cookies)
//   res.json(cookies)
// })


export default app;
