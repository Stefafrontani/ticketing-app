import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";
import jwt from "jsonwebtoken";

declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[];
    }
  }
}

// This line will make jest to import the file with that same name inside te mock folder we created on this commit, instead of the file of the path itself
jest.mock("../nats-wrapper");

// MongoMemoryServer
// This will used to create an isntance of mongo db in memory to run multiple tests at the same time without these tests reaching out to the same instance of mongo
let mongo: any;
beforeAll(async () => {
  jest.clearAllMocks();
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
  jest.clearAllMocks(); // Test was failing because mocks were not being cleared inside that file order-created-listener. When console.log(mock.calls), 3 elements were shown, 3 calls. Only 1 should be been
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

global.signin = (id?: string) => {
  // Build a JWT payload. { id, email }
  const payload = {
    id: id ? id : new mongoose.Types.ObjectId().toHexString(), // id passed in to the funcion or whatever id in here
    email: "test@test.com",
  };

  // Create the JWT! Use the JWT_KEY key
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Create session object. { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // Return a string - thats the cookie with the encoded data
  return [`express:sess=${base64}`]; // The array is because supertest expects an array when including all of our cookies
};
