const mongoose = require("mongoose");
require("dotenv").config();

const connectionString = process.env.MONGO_URL;
const connection = mongoose
  .connect(connectionString)
  .then(() =>
    console
      .log("MONGODB CONNECTED"))
      .catch((error) => console.log("MONGODB ERROR!!!", error))


module.exports = connection;
