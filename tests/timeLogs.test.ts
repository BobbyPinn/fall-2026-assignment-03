import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 2: Time Logs Tests', () => {
  it('should pass placeholder test', async () => {
    // TODO: Student implementation - Part 2: Time Logging Tests
    const user = await request(app)
      .post('/users')
      .send({ name: 'Time user', email: 'time@example.com' });

    const ticket = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(user.body.id))
      .send({ title: 'Track my hours' });

    // Log hours for a ticket (POST /tickets/:id/time)
    for (const hours of [2, 3, 5]) {
      const res = await request(app)
        .post(`/tickets/${ticket.body.id}/time`)
        .set('X-User-Id', String(user.body.id))
        .send({ hours });

      expect(res.status).toBe(201);
    }
    // Fetch total hours for a ticket (GET /tickets/:id/time)
    const total = await request(app).get(`/tickets/${ticket.body.id}/time`);

    // Verify aggregation math
    expect(total.status).toBe(200);
    expect(total.body.total_hours).toBe(10);
  });
});
