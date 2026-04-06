const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const redactMongoUri = (uri = "") =>
  uri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:[REDACTED]@");

const logStartupError = (label, error) => {
  console.error(`[startup] ${label}`);

  if (error instanceof Error) {
    console.error(error.stack || error.message);
    return;
  }

  console.error(error);
};

process.on("unhandledRejection", (error) => {
  logStartupError("Unhandled promise rejection", error);
});

process.on("uncaughtException", (error) => {
  logStartupError("Uncaught exception", error);
});

const startServer = async () => {
  console.log(
    `[startup] Booting API on port ${PORT} with Mongo URI: ${redactMongoUri(
      process.env.MONGODB_URI || ""
    )}`
  );
  await connectDB(process.env.MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  logStartupError("Failed to start server", error);
  process.exit(1);
});
