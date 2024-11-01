import request from 'supertest';

import { app } from '../../src/app';
import { startServer } from '../../src/utils/server';
import { clearDatabase, seedDatabase } from '../helpers';

const baseURL = `http://locahlhost:8000`;

describe('USERS', () => {
  before(async () => {
    await startServer('8000', app);
    await seedDatabase();
  });
  after(async () => {
    await clearDatabase();
  });
  describe('GET USERS', () => {
    let url = `${baseURL}/users`;

    it('Should fail get users', () => {
      request(app).get(url).expect(401);
    });
  });
});
