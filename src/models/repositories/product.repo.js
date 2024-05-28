"use strict";

const { Types } = require("mongoose");
const {
  product,
  electronic,
  clothing,
  furniture,
} = require("../../models/product.model");
const { query } = require("express");
const { getSelectData, unGetSelectData } = require("../../utils");

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const getListSearchProduct = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const results = await product
    .find(
      {
        isPublished: true,
        $text: { $search: regexSearch },
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .lean();
  return results;
};

const publishProductByShop = async ({ product_id, product_shop }) => {
  const foundShop = await product.findOneAndUpdate(
    {
      product_shop: Types.ObjectId.createFromHexString(product_shop),
      _id: Types.ObjectId.createFromHexString(product_id),
    },
    {
      isDraft: false,
      isPublished: true,
    }
  );
  return foundShop;
};

const unPublishProductByShop = async ({ product_id, product_shop }) => {
  const foundShop = await product.findOneAndUpdate(
    {
      product_shop: Types.ObjectId.createFromHexString(product_shop),
      _id: Types.ObjectId.createFromHexString(product_id),
    },
    {
      isDraft: true,
      isPublished: false,
    }
  );
  return foundShop;
};

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const findAllProduct = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
  return products;
};

const findProduct = async ({ product_id, unSelect = [] }) => {
  return await product.findById(product_id).select(unGetSelectData(unSelect));
};

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

module.exports = {
  findAllDraftsForShop,
  publishProductByShop,
  unPublishProductByShop,
  findAllPublishForShop,
  getListSearchProduct,
  findAllProduct,
  findProduct,
};
