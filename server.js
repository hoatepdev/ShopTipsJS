const app = require("./src/app");
// const {app} = require('./src/configs/')
const port = process.env.PORT || 3056;
const server = app.listen(port, () =>
  console.log(`WSV eCommerce start with port ${port}`)
);

// process.on("SIGINT", () => {
//   console.log("Exit server express");
// });

module.exports = server;
