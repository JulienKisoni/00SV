import { connection } from 'mongoose';

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

  await Promise.all(promises);

  console.log('Database cleared successfully');
};

export const seedDatabase = () => {};

export const injectUsers = () => {};
export const injectStores = () => {};
export const injectProducts = () => {};
export const injectReviews = () => {};
export const injectOrders = () => {};
