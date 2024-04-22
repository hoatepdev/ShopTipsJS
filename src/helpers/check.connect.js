const mongoose = require("mongoose");
const os = require("os");
const process = require("process");

const _SECONDS = 10000;
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log(`Number of connections: ${numConnection}`);
  return numConnection;
};

const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;

    const maxConnection = numCores * 5;

    console.log(`Active connections: ${numConnection}`);
    console.log(`MemoryUsage ${memoryUsage / 1024 / 1024} MB`);

    if (numConnection > maxConnection) {
      console.log("Connection overload detected!");
    }
  }, _SECONDS);
};

module.exports = {
  countConnect,
  checkOverload,
};
