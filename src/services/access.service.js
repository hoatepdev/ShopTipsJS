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
      publicKey,
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
    // const publicKeyObject = crypto.createPublicKey(publicKeyString);
    // console.log("publicKeyObject", publicKeyObject);

    // console.log("tokens2", tokens);
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
    console.log("keyStore", keyStore);
    const delKey = await KeyTokenService.removeTokenById(keyStore._id);

    console.log("delKey", delKey);

    return delKey;
  };

  static handleRefreshToken = async (refreshToken) => {
    // console.log("refreshToken", refreshToken);
    // check refreshToken đã được sử dụng hay chưa
    const foundToken = await KeyTokenService.findByRefreshTokensUsed(
      refreshToken
    );
    console.log("foundToken", foundToken);
    if (!foundToken) {
      // tìm key theo refreshToken
      const holderToken = await KeyTokenService.findByRefreshToken(
        refreshToken
      );
      // console.log("holderToken", holderToken);

      if (!holderToken)
        throw new AuthFailureError("Shop not registered! - holderToken");

      // verify refreshToken để lấy ra thông tin user
      const { userId, email } = await verifyJWT(
        refreshToken,
        holderToken.publicKey
      );
      console.log("holderToken", holderToken);

      // tìm shop theo email
      const foundShop = await findByEmail({ email });

      if (!foundShop) throw new AuthFailureError("Shop not registered");
      // tạo cặp key mới

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fileds: ["_id", "name", "email"],
            object: foundShop,
          }),
          tokens: await this.generateTokens(foundShop, [
            ...holderToken.refreshTokensUsed,
            refreshToken,
          ]),
        },
      };
    }
    // nếu sử dụng rồi thì xóa hết key đi và báo lỗi

    // console.log({ userId, email });
    await KeyTokenService.deleteKeyByRefreshToken(foundToken.refreshToken);
    throw new ForbiddenError();
  };
}

module.exports = AccessService;
