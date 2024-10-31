import { connection } from 'mongoose';

import { injectUsers } from './users';
import { injectStores } from './stores';
import { injectProducts } from './products';

interface DeleteResult {
  acknowledged: boolean;
  deletedCount: number;
}

export const clearDatabase = async () => {
  const { collections } = connection;

  let promises: Promise<DeleteResult>[] = [];

  for (const key in collections) {
    if (Object.prototype.hasOwnProperty.call(collections, key)) {
      const collection = collections[key];
      promises.push(collection.deleteMany({}));
    }
  }

  /* 
    I can use classes to avoid test repetition
    1. Validation Class
    const validation = new Validation(data, function);
    validation.validateResponse

    2. TestCase class
    const test case = new TestCase(request, ect...);

    testCase.runWithSuccess('');

    testCase.runWithFailure
  
  */

  await Promise.all(promises);

  console.log('Database cleared successfully');
};

export const seedDatabase = async () => {
  await clearDatabase();
  const users = await injectUsers();
  const stores = await injectStores(users[0]);
  if (stores[0]) {
    await injectProducts(stores[0]);
  }
};
