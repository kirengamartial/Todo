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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("./index"));
// Test cases for user registration
describe('POST /users', () => {
    test('should register a new user and return user ID and JWT token', () => __awaiter(void 0, void 0, void 0, function* () {
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };
        const response = yield (0, supertest_1.default)(index_1.default)
            .post('/users')
            .send(userData);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        expect(response.headers['set-cookie'][0]).toMatch(/^jwt=/);
    }));
    test('should return validation errors for invalid user data', () => __awaiter(void 0, void 0, void 0, function* () {
        // Send invalid user data to trigger validation errors
        const response = yield (0, supertest_1.default)(index_1.default)
            .post('/users')
            .send({});
        expect(response.status).toBe(500); // Update to handle server-side error correctly
        expect(response.body).toHaveProperty('errors');
    }));
});
// Test cases for user login
describe('POST /users/login', () => {
    test('should login a user and return user ID and JWT token', () => __awaiter(void 0, void 0, void 0, function* () {
        const loginData = {
            email: 'test@example.com',
            password: 'password123'
        };
        const response = yield (0, supertest_1.default)(index_1.default)
            .post('/users/login')
            .send(loginData);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        expect(response.headers['set-cookie'][0]).toMatch(/^jwt=/);
    }));
    test('should return authentication error for incorrect login credentials', () => __awaiter(void 0, void 0, void 0, function* () {
        const loginData = {
            email: 'test@example.com',
            password: 'wrongpassword'
        };
        const response = yield (0, supertest_1.default)(index_1.default)
            .post('/users/login')
            .send(loginData);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'incorrect password');
    }));
});
// Test cases for user logout
describe('GET /users/logout', () => {
    test('should logout a user by clearing the JWT cookie', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default).get('/users/logout');
        expect(response.status).toBe(200);
        expect(response.headers['set-cookie'][0]).toMatch(/^jwt=;/);
    }));
});
// Test cases for fetching todos
describe('GET /', () => {
    test('should return an array of todos when user is logged in', () => __awaiter(void 0, void 0, void 0, function* () {
        const loginData = {
            email: 'test@example.com',
            password: 'password123'
        };
        // First login the user
        const loginResponse = yield (0, supertest_1.default)(index_1.default)
            .post('/users/login')
            .send(loginData);
        expect(loginResponse.status).toBe(200); // Ensure successful login
        // Then fetch todos using the JWT token from login response
        const response = yield (0, supertest_1.default)(index_1.default)
            .get('/')
            .set('Cookie', loginResponse.headers['set-cookie']); // Pass the JWT token in the cookie
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    }));
    test('should return authentication error when user is not logged in', () => __awaiter(void 0, void 0, void 0, function* () {
        // Attempt to fetch todos without logging in
        const response = yield (0, supertest_1.default)(index_1.default).get('/');
        expect(response.status).toBe(400); // Ensure that authentication error is handled correctly
        expect(response.body).toHaveProperty('message', 'user is not logined in');
    }));
});
// Test cases for creating a new todo
describe('POST /', () => {
    describe('given a title and completed', () => {
        test('should respond with the status of 200', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default).post('/').send({
                title: "learn something",
                completed: true
            });
            expect(response.statusCode).toBe(200);
        }));
        test('should send json in the content type header', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default).post('/').send({
                title: "learn something",
                completed: true
            });
            expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
        }));
    });
    describe('when the title and completed is missing', () => {
        test('should respond with a status code of 400', () => __awaiter(void 0, void 0, void 0, function* () {
            const bodyData = [
                { title: 'title' },
                { completed: true },
                {}
            ];
            for (const body of bodyData) {
                const response = yield (0, supertest_1.default)(index_1.default).post('/').send(body);
                expect(response.statusCode).toBe(400);
            }
        }));
    });
});
