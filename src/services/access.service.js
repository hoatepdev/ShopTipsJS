"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static generateTokens = async (shop) => {
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
      publicKey,
      privateKey
    );

    // lưu publicKey vào db
    const keyToken = await KeyTokenService.createKeyToken({
      userId,
      publicKey,
      refreshToken: tokens.refreshToken,
    });

    if (!keyToken) {
      return {
        code: "xxxx",
        message: "keyToken error!",
      };
    }
    // const publicKeyObject = crypto.createPublicKey(publicKeyString);
    // console.log("publicKeyObject", publicKeyObject);

    console.log("tokens2", tokens);
    return tokens;
  };

  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered");

    const match = await bcrypt.compare(password, foundShop.password);
    if (!match) throw new BadRequestError("Authentication error");

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
}

module.exports = AccessService;
