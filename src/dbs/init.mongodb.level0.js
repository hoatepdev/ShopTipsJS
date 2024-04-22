"use strict";

const mongoose = require("mongoose");
const connectString = `mongodb://localhost:27017/ShopDev`;

mongoose
  .connect(connectString)
  .then(() => console.log(`Connected Mongodb Success`))
  .catch((err) => console.log(`Error Connect`));

// dev
if (1 === 0) {
  mongoose.set("debug", true);
  mongoose.set("debug", { color: true });
}

module.exports = mongoose;