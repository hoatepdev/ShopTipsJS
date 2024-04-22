require("dotenv").config();
const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const app = express();
const morgan = require("morgan");
const { checkOverload } = require("./helpers/check.connect");

// init middlewares

app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

// init database
require("./dbs/init.mongodb");

// checkOverload();

// init routes

app.get("/", (req, res) => {
  const compressionStr = "Hello World!";

  return res.status(200).json({
    message: "123123aaaa123",
    metadata: compressionStr.repeat(3000),
  });
});

module.exports = app;
