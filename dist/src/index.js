"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const Todo_1 = __importDefault(require("../models/Todo"));
const users_1 = __importDefault(require("../models/users"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
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
mongoose_1.default.connect('mongodb+srv://test1234:test1234@cluster0.v9lpw.mongodb.net/ToDoApp')
    .then(() => {
    const spacs = (0, swagger_jsdoc_1.default)(options);
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(spacs));
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
app.get('/', authMiddleware_1.requireAuth, (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todos = yield Todo_1.default.find();
        res.status(200).json(todos);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
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
app.post('/', authMiddleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, completed } = req.body;
        if (!completed || !title) {
            return res.status(400).json({ message: 'Missing or invalid "completed" field or "title" field' });
        }
        const todo = new Todo_1.default({ title, completed });
        yield todo.save();
        res.status(200).json(todo);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
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
app.put('/:id', authMiddleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;
        const todo = yield Todo_1.default.findById(id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        todo.title = title || todo.title;
        todo.completed = completed !== null && completed !== void 0 ? completed : todo.completed;
        yield todo.save();
        res.status(200).json(todo);
        res.json(todo);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
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
app.delete('/:id', authMiddleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedTodo = yield Todo_1.default.findByIdAndDelete(id);
        if (!deletedTodo) {
            res.status(404).json({ message: 'Todo not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
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
app.get('/users', authMiddleware_1.requireAuth, (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield users_1.default.find();
        res.status(200).json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
const handleErros = (err) => {
    console.log(err.message, err.code);
    let errorx = { username: '', email: '', password: '' };
    if (err.code === 11000) {
        errorx['email'] = 'Email already exists';
    }
    if (err.message.includes('User validation failed')) {
        // console.log(Object.values(err.errors))
        Object.values(err.errors).forEach((errory) => {
            console.log(errory.properties);
            const path = errory.properties.path;
            errorx[path] = errory.properties.message;
        });
    }
    return errorx;
};
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, 'Martial secret', {
        expiresIn: maxAge
    });
};
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
app.post('/users', authMiddleware_1.preventLoggedInUserAccess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        const newUser = new users_1.default({ username, email, password });
        yield newUser.save();
        const token = createToken(newUser._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: newUser._id });
    }
    catch (error) {
        const errors = handleErros(error);
        res.status(500).json({ errors });
    }
}));
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
app.post('/users/login', authMiddleware_1.preventLoggedInUserAccess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    try {
        const user = yield users_1.default.findOne({ email });
        if (user) {
            const auth = yield bcrypt_1.default.compare(password, user.password);
            if (auth) {
                const token = createToken(user._id);
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                return res.status(200).json({ user: user._id });
            }
            res.status(400).json({ message: "incorrect password" });
        }
        res.status(400).json({ message: "incorrect email" });
    }
    catch (error) {
        res.status(500).json(error);
    }
}));
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
app.get('/users/logout', authMiddleware_1.requireAuth, (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.status(200).json('user is logout');
});
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
app.put('/users/:id', authMiddleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { username, email, password } = req.body;
        const user = yield users_1.default.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.username = username || user.username;
        user.email = email || user.email;
        user.password = password || user.password;
        yield user.save();
        res.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
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
app.delete('/users/:id', authMiddleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield users_1.default.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
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
exports.default = app;
