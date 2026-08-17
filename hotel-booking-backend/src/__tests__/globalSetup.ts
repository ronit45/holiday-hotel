import { MongoMemoryServer } from "mongodb-memory-server";

export default async function globalSetup() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Store the instance and URI so globalTeardown & setup.ts can use them
  (globalThis as any).__MONGOD__ = mongod;
  process.env.MONGODB_TEST_URI = uri;
}
