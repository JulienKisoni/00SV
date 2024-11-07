import request from 'supertest';
import should from 'should';
import { type Server } from 'http';

import { app } from '../../src/app';
import { startServer } from '../../src/utils/server';
import { clearDatabase, seedDatabase } from '../helpers';
import { IProductDocument } from '../../src/types/models';
import { validateProduct } from '../units/products.spec';

let server: Server | undefined;
const urls = {
  signup: '',
  login: '',
  addStore: '',
  getProducts: '',
  addProduct: '',
  addReview: '',
  addOrder: '',
};
const payloads = {
  user: {
    password: '',
    email: '',
    username: '',
    role: '',
  },
  token: '',
  store: {
    name: '',
    description: '',
    active: true,
  },
  product: {
    name: '',
    quantity: 0,
    description: '',
    minQuantity: 0,
    active: true,
    unitPrice: 0,
  },
  review: {
    productId: '',
    title: '',
    content: '',
    stars: 0,
  },
  order: {
    items: [] as { productId: string; quantity: number }[],
  },
};

describe.only('E2E', () => {
  before(async () => {
    server = await startServer('8000', app);
    await seedDatabase();
  });

  after(async () => {
    await clearDatabase();
    await clearDatabase();
    if (server) {
      server.close();
    }
  });

  it('FROM USER REGISTRATION TO ORDER', async () => {
    // Signup
    urls.signup = '/users/signup';
    payloads.user.email = 'edouard@mail.com';
    payloads.user.password = 'edouard';
    payloads.user.username = 'edouard';
    payloads.user.role = 'admin';
    const res1 = await request(app).post(urls.signup).send(payloads.user);
    should(res1.statusCode).equal(201);
    const userId = res1.body as string;
    should(userId).be.String;

    // Login
    urls.login = '/auth/login';
    const res2 = await request(app).post(urls.login).send({ email: payloads.user.email, password: payloads.user.password });
    should(res2.statusCode).equal(200);
    const token = res2.body.accessToken as string;
    should(token).be.String;
    payloads.token = token;

    // Create store
    urls.addStore = '/stores';
    payloads.store.name = 'Edouard store';
    payloads.store.description = 'Edouard store description';
    const res3 = await request(app).post(urls.addStore).set('Authorization', `Bearer ${payloads.token}`).send(payloads.store);
    should(res3.statusCode).equal(201);
    const storeId = res3.body.storeId as string;
    should(storeId).be.String;

    // Get existing products
    urls.getProducts = '/products';
    const res4 = await request(app).get(urls.getProducts).set('Authorization', `Bearer ${payloads.token}`);
    should(res4.statusCode).equal(200);
    const existingProducts = res4.body.products as IProductDocument[];
    existingProducts.forEach((product) => {
      validateProduct(product);
    });

    // Add product
    urls.addProduct = `/stores/${storeId}/products`;
    payloads.product.name = 'Edouard product';
    payloads.product.description = 'Edouard product awesome description';
    payloads.product.quantity = 10;
    payloads.product.minQuantity = 3;
    payloads.product.unitPrice = 400;
    const res5 = await request(app).post(urls.addProduct).set('Authorization', `Bearer ${payloads.token}`).send(payloads.product);
    should(res5.statusCode).equal(201);
    const productId = res5.body.productId as string;
    should(productId).be.String;

    // Add review
    urls.addReview = '/reviews';
    payloads.review.title = 'Good product';
    payloads.review.content = 'This is a very good product';
    payloads.review.stars = 5;
    payloads.review.productId = existingProducts[0]._id.toString();
    const res6 = await request(app).post(urls.addReview).set('Authorization', `Bearer ${payloads.token}`).send(payloads.review);
    should(res6.statusCode).equal(201);
    const reviewId = res6.body.reviewId as string;
    should(reviewId).be.String;

    // Add order
    urls.addOrder = '/orders';
    payloads.order.items = existingProducts.map((product) => {
      return { productId: product._id.toString(), quantity: product.minQuantity };
    });
    payloads.order.items.push({ productId, quantity: 3 });
    const res7 = await request(app).post(urls.addOrder).set('Authorization', `Bearer ${payloads.token}`).send(payloads.order);
    should(res7.statusCode).equal(201);
    const orderId = res7.body.orderId as string;
    should(orderId).be.String;
  });
});
