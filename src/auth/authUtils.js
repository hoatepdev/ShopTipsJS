"use strict";
const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");
const {
  AuthFailureError,
  NotFoundError,
  BadRequestError,
} = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESHTOKEN: "x-rtoken-id",
};

const createTokenPair = async (payload, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "2h",
    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "2 days",
    });
    // verify
    // JWT.verify(accessToken, publicKey, (err, decode) => {
    //   if (err) console.log("error verify: ", err);
    //   // console.log("decode verify: ", decode);
    // });
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid request");

  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Invalid request 0");

  console.log(
    HEADER.REFRESHTOKEN,
    req.headers,
    req.headers[HEADER.REFRESHTOKEN]
  );

  const refreshToken = req.headers[HEADER.REFRESHTOKEN];
  if (!refreshToken) {
    throw new BadRequestError("Refreshtoen invalid");
  }
  // console.log("refreshToken", refreshToken);
  JWT.verify(refreshToken, keyStore.publicKey, (err, decode) => {
    if (err) throw new AuthFailureError("Invalid request 0");
    // console.log("decode verify: ", decode);
    req.keyStore = keyStore;
    req.user = decode;
    req.refreshToken = refreshToken;

    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError("Invalid request");
    JWT.verify(accessToken, keyStore.publicKey, (err, decode) => {
      if (err) throw new AuthFailureError("Invalid request1", err);
      // console.log("decode verify: ", decode);
      req.keyStore = keyStore;
      next();
    });
  });
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
};
