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
// routes/todoRoutes.ts
const express_1 = __importDefault(require("express"));
const todo_1 = __importDefault(require("../models/todo"));
const router = express_1.default.Router();
router.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todos = yield todo_1.default.find();
        res.json(todos);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, completed } = req.body;
        const todo = new todo_1.default({ title, completed });
        yield todo.save();
        res.status(201).json(todo);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.default = router;
