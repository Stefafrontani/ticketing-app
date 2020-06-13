import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";

declare global {
  namespace NodeJS {
    interface Global {
      signin(): Promise<string[]>;
    }
  }
}

// MongoMemoryServer
// This will used to create an isntance of mongo db in memory to run multiple tests at the same time without these tests reaching out to the same instance of mongo
let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = "asdfasdf";

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    // To mongoose not complain. Not big of a deal
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Remove all collections before each test
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// Disconnect from database after all tests run
afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = async () => {
  const email = "test@test.com";
  const password = "password";

  const response = await request(app).post("/api/users/signup").send({
    email,
    password,
  });
  expect(201);

  const cookie = response.get("Set-Cookie");

  return cookie;
};
