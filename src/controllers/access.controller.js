"use strict";

const { CREATED, OK, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  signUp = async (req, res, next) => {
    new CREATED({
      message: "Registered OK!",
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };
  login = async (req, res, next) => {
    new OK({
      message: "Login success!",
      metadata: await AccessService.login(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };
  logout = async (req, res, next) => {
    new OK({
      message: "Logout success!",
      // metadata: await AccessService.login(req.body),
      // options: {
      //   limit: 10,
      // },
    }).send(res);
  };
}

module.exports = new AccessController();
