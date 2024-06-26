"use strict";

const { CREATED, SuccessResponse, OK } = require("../core/success.response");
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
    new SuccessResponse({
      message: "Login success!",
      metadata: await AccessService.login(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };
  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout success!",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };
  handlerRefreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: "Refresh token success!",
      metadata: await AccessService.handlerRefreshToken({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res);
  };
}

module.exports = new AccessController();
