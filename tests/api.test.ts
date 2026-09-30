import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

async function makeUser() {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Test user', email: 'test@example.com' });
  return res.body;
}
describe('Part 1: API Integration Tests', () => {
  // TODO: Student implementation - Part 1: Integration Testing
  // Test user creation (POST /users)
  it('creates a user and returns 201', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Jesus', email: 'jesus@example.com' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Jesus');
    expect(res.body.id).toBeDefined();
  });

  // Test ticket creation (POST /tickets)
  it('creates a ticket creation 201', async () => {
    const user = await makeUser();

    const res = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(user.id))
      .send({ title: 'My ticket', description: 'Details' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('My ticket');
    expect(res.body.creator_id).toBe(user.id);
  });

  it('updates a ticket status with PATCH', async () => {
    const user = await makeUser();

    const created = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(user.id))
      .send({ title: 'Move me' });

    const res = await request(app)
      .patch(`/tickets/${created.body.id}/status`)
      .set('X-User-Id', String(user.id))
      .send({ status: 'DONE' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('DONE');
  });
  // Test auth middleware rejection (401 when X-User-Id is missing or invalid)
  it('returns 401 when X-User-Id is missing', async () => {
    const res = await request(app).post('/tickets').send({ title: 'No auth' });

    expect(res.status).toBe(401);
  });

  it('returns 401 when X-User-Id is not a number', async () => {
    const res = await request(app)
      .post('/tickets')
      .set('X-User-Id', 'abc')
      .send({ title: 'Bad auth' });

    expect(res.status).toBe(401);
  });

  // Test 404 responses for non-existent users and tickets

  it('returns 404 for a user that does not exist', async () => {
    const res = await request(app).get('/users/999');

    expect(res.status).toBe(404);
  });

  it('returns 404 for a ticket that does not exist', async () => {
    const res = await request(app).get('/tickets/999');

    expect(res.status).toBe(404);
  });
  // Test pagination and filtering on GET /tickets
  it('supports pagination with limit and offset', async () => {
    const user = await makeUser();
    for (const title of ['One', 'Two', 'Three']) {
      await request(app)
        .post('/tickets')
        .set('X-User-Id', String(user.id))
        .send({ title });
    }

    const page1 = await request(app).get('/tickets?limit=2&offset=0');
    expect(page1.status).toBe(200);
    expect(page1.body.length).toBe(2);

    const page2 = await request(app).get('/tickets?limit=2&offset=2');
    expect(page2.body.length).toBe(1);
    expect(page2.body[0].title).toBe('Three');
  });

  if('filters tickets by status', async () => {
    const user = await makeUser();

    const first = await request(app)
    .post('/tickets')
    .set('X-User-Id', String(user.id))
    .send({ title: 'Will be DONE' });

    await request(app)
      .post('/tickets')
    .set('X-User-Id', String(user.id))
    .send({ title: 'Stays TODO' });

    await request(app)
      .patch(`/tickets/${first.body.id}/status`)
    .set('X-User-Id', String(user.id))
    .send({ title: 'DONE' });

    const res = await request(app).get('/tickets?status=DONE');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].status).toBe('DONE');

  });
});
