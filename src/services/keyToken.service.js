"use strict";

const { Types } = require("mongoose");
const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    refreshToken = null,
    refreshTokensUsed = [],
  }) => {
    try {
      const publicKeyString = publicKey.toString();
      // console.log("publicKey", publicKey, publicKeyString);
      // console.log("refreshToken", refreshToken);
      const filter = { user: userId },
        update = {
          publicKey: publicKeyString,
          refreshTokensUsed,
          refreshToken,
        },
        options = {
          new: true,
          upsert: true,
        };

      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );

      // const tokens = await keytokenModel.create({
      //   user: userId,
      //   publicKey: publicKeyString,
      // });
      return tokens;
    } catch (error) {}
  };

  static findByUserId = async (userId) => {
    return await keytokenModel
      .findOne({ user: Types.ObjectId.createFromHexString(userId) })
      .lean();
  };

  static removeTokenById = async (_id) => {
    return await keytokenModel.deleteOne({ _id }).lean();
  };

  static findByRefreshTokensUsed = async (refreshToken) => {
    return await keytokenModel
      .findOne({ refreshTokensUsed: { $in: [refreshToken] } })
      .lean();
  };

  static findByRefreshToken = async (refreshToken) => {
    return keytokenModel
      .findOne({ refreshToken })
      .catch((err) => console.log("err", err));
  };

  static deleteKeyById = async (userId) => {
    return await keytokenModel.findByIdAndDelete({
      user: userId,
    });
  };
  static deleteKeyByRefreshToken = async (refreshToken) => {
    return await keytokenModel.deleteOne({
      refreshToken,
    });
  };
}

module.exports = KeyTokenService;
