const path = require("path");
const { MongoMemoryServer } = require("mongodb-memory-server");

const start = async () => {
  const downloadDir = path.join(__dirname, "..", "tests", ".cache", "mongodb-binaries");

  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: "social_media_app",
      ip: "127.0.0.1"
    },
    binary: {
      downloadDir
    }
  });

  console.log(`MongoMemoryServer running at ${mongod.getUri()}`);

  const shutdown = async () => {
    await mongod.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

start().catch((error) => {
  console.error("Failed to start MongoMemoryServer", error);
  process.exit(1);
});
