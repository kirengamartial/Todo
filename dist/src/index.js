"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const todos_1 = __importDefault(require("../routes/todos"));
mongoose_1.default.connect('mongodb+srv://test1234:test1234@cluster0.v9lpw.mongodb.net/ToDoApp')
    .then(() => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/todos', todos_1.default);
    app.listen(3000, () => console.log('connected to database successfully'));
})
    .catch((error) => console.log(error));
