const fs = require('fs');
const request = require('supertest');
const app = require('../server');
const { DATA_FILE } = require('../src/store');

let originalData;

beforeAll(() => {
  originalData = fs.readFileSync(DATA_FILE, 'utf-8');
});

beforeEach(() => {
  fs.writeFileSync(DATA_FILE, '[]');
});

afterAll(() => {
  fs.writeFileSync(DATA_FILE, originalData);
});

describe('POST /habits', () => {
  test('creates a habit with streak 0', async () => {
    const res = await request(app).post('/habits').send({ name: 'Read' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Read', streak: 0, lastDoneDate: null });
  });

  test('rejects a missing name', async () => {
    const res = await request(app).post('/habits').send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /habits/:id/done', () => {
  test('marks an existing habit done and increments streak', async () => {
    const created = await request(app).post('/habits').send({ name: 'Workout' });
    const res = await request(app).post(`/habits/${created.body.id}/done`);

    expect(res.status).toBe(200);
    expect(res.body.streak).toBe(1);
    expect(res.body.lastDoneDate).not.toBeNull();
  });

  test('returns 404 for an unknown habit', async () => {
    const res = await request(app).post('/habits/does-not-exist/done');
    expect(res.status).toBe(404);
  });
});
