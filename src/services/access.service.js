"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static generateTokens = async (shop, refreshTokensUsed = []) => {
    const userId = shop._id.toString();
    // tạo cặp key theo thuật toán rsa
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
    });
    // create access token và refresh token - verify token
    const tokens = await createTokenPair(
      { userId, email: shop.email },
      privateKey
    );

    // lưu publicKey vào db
    const keyToken = await KeyTokenService.createKeyToken({
      userId,
      publicKey,
      refreshToken: tokens.refreshToken,
      refreshTokensUsed,
    });

    if (!keyToken) {
      return {
        code: "xxxx",
        message: "keyToken error!",
      };
    }
    return tokens;
  };

  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered");

    const match = await bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication error");

    return {
      code: 200,
      metadata: {
        shop: getInfoData({
          fileds: ["_id", "name", "email"],
          object: foundShop,
        }),
        tokens: await this.generateTokens(foundShop),
      },
    };
  };

  static signUp = async ({ name, email, password }) => {
    // try {
    const hodelShop = await shopModel.findOne({ email }).lean();

    if (hodelShop) {
      throw new BadRequestError("Error: Shop already registerd!");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });
    console.log("newShop", newShop);
    if (newShop) {
      // console.log("Created token success:", tokens);

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fileds: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens: await this.generateTokens(newShop),
        },
      };
    }
    return {
      code: 200,
      metadata: null,
    };
    // } catch (error) {
    //   return {
    //     code: "xxx",
    //     message: error.message,
    //     status: "error",
    //   };
    // }
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeTokenById(keyStore._id);

    return delKey;
  };

  static handlerRefreshToken = async ({ refreshToken, user, keyStore }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyByRefreshToken(foundToken.refreshToken);
      throw new ForbiddenError();
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError("Shop not registered! - keyStore");
    }

    const foundShop = await findByEmail({ email });

    if (!foundShop) throw new AuthFailureError("Shop not registered");

    // console.log("foundShop", foundShop);
    // tạo cặp key mới
    const tokens = await this.generateTokens(foundShop, [
      ...keyStore.refreshTokensUsed,
      refreshToken,
    ]);

    return {
      code: 200,
      metadata: {
        shop: getInfoData({
          fileds: ["_id", "name", "email"],
          object: foundShop,
        }),
        tokens,
      },
    };
  };
}

module.exports = AccessService;
