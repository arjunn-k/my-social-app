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
  if (mongoose.connection.readyState === 0) {
    await connectDB(process.env.MONGODB_URI);
  }
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

describe("Posts API", () => {
  test("creates a post and toggles like status", async () => {
    const registerResponse = await request(app).post("/api/auth/register").send({
      username: "author",
      email: "author@example.com",
      password: "password123",
      displayName: "Author"
    });

    const token = registerResponse.body.token;

    const createResponse = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .field("content", "My first post");

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body.post.content).toBe("My first post");

    const likeResponse = await request(app)
      .post(`/api/posts/${createResponse.body.post._id}/like`)
      .set("Authorization", `Bearer ${token}`);

    expect(likeResponse.statusCode).toBe(200);
    expect(likeResponse.body.post.likesCount).toBe(1);
    expect(likeResponse.body.post.isLiked).toBe(true);
  });
});
