const app = require("../backend/src/app");
const connectDB = require("../backend/src/config/db");

let connectionPromise;

module.exports = async (req, res) => {
  if (!connectionPromise) {
    connectionPromise = connectDB(process.env.MONGODB_URI);
  }

  await connectionPromise;
  return app(req, res);
};

