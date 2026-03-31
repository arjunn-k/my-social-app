const path = require("path");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;
let app;

jest.setTimeout(30000);

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  process.env.JWT_EXPIRES_IN = "7d";
  process.env.NODE_ENV = "test";
  process.env.MONGOMS_DOWNLOAD_DIR = path.join(__dirname, ".cache", "mongodb-binaries");
  mongoServer = await MongoMemoryServer.create({
    binary: {
      downloadDir: process.env.MONGOMS_DOWNLOAD_DIR
    }
  });
  process.env.MONGODB_URI = mongoServer.getUri();
  const connectDB = require("../src/config/db");
  await connectDB(process.env.MONGODB_URI);
  app = require("../src/app");
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("Auth API", () => {
  test("registers and returns a JWT token", async () => {
    const response = await request(app).post("/api/auth/register").send({
      username: "alice",
      email: "alice@example.com",
      password: "password123",
      displayName: "Alice",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.username).toBe("alice");
  });

  test("logs in and returns the authenticated user", async () => {
    await request(app).post("/api/auth/register").send({
      username: "bob",
      email: "bob@example.com",
      password: "password123",
      displayName: "Bob",
    });

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "bob@example.com",
      password: "password123",
    });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.token).toBeDefined();

    const meResponse = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.body.user.email).toBe("bob@example.com");
  });
});
