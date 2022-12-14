const request = require('supertest');
const router = require('../app');

describe('GET /api/posts', () => {

    describe('returns an array containing all the blog posts stored in the database', () => {

        it('should respond with a 200 status code', async () => {
            const response = await request(router).get('/api/posts');
            expect(response.statusCode).toBe(200);
        });

        it('should specify json in the content type header', async () => {
            const response = await request(router).get('/api/posts');
            expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
        });

        it('should resond with the array of blogposts as a json object', async () => {
            const response = await request(router).get('/api/posts');
            expect(response.body.blogPosts).toBeDefined();
        });
    });

    describe('returns an array of blogposts matching the query string tag parameter', () => {
        
        it('should respond with a 200 status code', async () => {
            const response = await request(router).get('/api/posts?tag=trends');
            expect(response.statusCode).toBe(200);
        });

        it('should specify json in the content type header', async () => {
            const response = await request(router).get('/api/posts?tag=trends');
            expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
        });

        it('should resond with the array of blogposts as a json object', async () => {
            const response = await request(router).get('/api/posts?tag=trends');
            expect(response.body.blogPosts).toBeDefined();
        });
    });
});

describe('GET /api/tags', () => {

    describe('returns a list of all tags in the database', () => {

        it('should respond with a 200 status code', async () => {
            const response = await request(router).get('/api/tags');
            expect(response.statusCode).toBe(200);
        });

        it('should specify json in the content type header', async () => {
            const response = await request(router).get('/api/tags');
            expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
        });

        it('should resond with the array of tags', async () => {
            const response = await request(router).get('/api/tags');
            expect(response.body.tags).toBeDefined();
        });
    });
});