import request from 'supertest';

import { app } from '../../src/app';
import { startServer } from '../../src/utils/server';
import { clearDatabase, seedDatabase } from '../helpers';

const baseURL = '/users';

describe('USERS', () => {
  before(async () => {
    await startServer('8000', app);
    await seedDatabase();
  });
  after(async () => {
    await clearDatabase();
  });
  describe('GET USERS', () => {
    let url = baseURL;

    it('Should fail get users', async () => {
      const res = await request(app).get(url).expect(401);
      console.log('body ', res.body);
    });
  });
});
