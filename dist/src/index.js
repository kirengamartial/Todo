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
const todo_1 = __importDefault(require("../models/todo"));
const users_1 = __importDefault(require("../models/users"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
mongoose_1.default.connect('mongodb+srv://test1234:test1234@cluster0.v9lpw.mongodb.net/ToDoApp')
    .then(() => {
    console.log('database connected');
    app.listen(3000, () => console.log('server is running on port 3000'));
})
    .catch((error) => console.log(error));
// Todos 
app.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todos = yield todo_1.default.find();
        res.status(200).json(todos);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
app.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, completed } = req.body;
        if (!completed || !title) {
            return res.status(400).json({ message: 'Missing or invalid "completed" field or "title" field' });
        }
        const todo = new todo_1.default({ title, completed });
        yield todo.save();
        res.status(200).json(todo);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
app.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;
        const todo = yield todo_1.default.findById(id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        todo.title = title || todo.title;
        todo.completed = completed !== null && completed !== void 0 ? completed : todo.completed;
        yield todo.save();
        res.json(todo);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
app.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield todo_1.default.findByIdAndDelete(id);
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
// users
app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield users_1.default.find();
        res.status(200).send(users);
    }
    catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
}));
app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        const users = new users_1.default({ username, email, password });
        yield users.save();
        res.status(200).send(users);
    }
    catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
}));
app.put('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { username, email, password } = req.body;
        const user = yield users_1.default.findById(id);
        if (user) {
            user.username = username || user.username;
            user.email = email || user.email;
            user.password = password || user.password;
            yield user.save();
            res.status(200).send(user);
        }
    }
    catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
}));
app.delete('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield users_1.default.findByIdAndDelete(id);
        res.status(200).send();
    }
    catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
}));
exports.default = app;
