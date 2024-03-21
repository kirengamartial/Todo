import request from 'supertest';
import app from './index';
import { describe } from 'node:test';

describe('GET /', () => {
  test('should return an array of todos', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('POST /', () => {
   describe('given a title and completed',() => {
     test('should respond with the status of 200', async() => {
      const response = await request(app).post('/').send({
        title: "learn something",
        completed: true
      })
      expect(response.statusCode).toBe(200)
     })

     test('should send json in the content type header', async() => {
      const response = await request(app).post('/').send({
        title: "learn something",
        completed: true
      })
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
     })
   });

   describe('when the title and completed is missing', () => {
    test('should respond with a status code of 400', async() => {
      const bodyData = [
        {title: 'title'},
        {completed: true},
        {}
      ]

       for(const body of bodyData) {
        const response = await request(app).post('/').send(body)
        expect(response.statusCode).toBe(400)
       }
    })

   })
});


// users
describe('GET /users', () => {
  test('should return an array of users', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('POST /users', () => {
   describe('given username, email and password',() => {
     test('should respond with the status of 200', async() => {
      const response = await request(app).post('/users').send({
        username: "Martial",
        email: 'martial@gmail.com',
        password: '12345'
      })
      expect(response.statusCode).toBe(200)
     })

     test('should send json in the content type header', async() => {
      const response = await request(app).post('/users').send({
        username: "Martial",
        email: 'martial@gmail.com',
        password: '12345'
      })
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
     })
   });

   describe('when username, email or password is missing', () => {
    test('should respond with a status code of 400', async() => {
      const bodyData = [
        {username: 'title'},
        {email: 'martialkirenga@gmail.com'},
        {password: '12345'},
        {}
      ]

       for(const body of bodyData) {
        const response = await request(app).post('/').send(body)
        expect(response.statusCode).toBe(400)
       }
    })

   })
});
