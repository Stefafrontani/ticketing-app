import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";

// MongoMemoryServer
// This will used to create an isntance of mongo db in memory to run multiple tests at the same time without these tests reaching out to the same instance of mongo
let mongo: any;
beforeAll(async () => {
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
