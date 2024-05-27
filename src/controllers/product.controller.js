"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const ProductFactory = require("../services/product.service");
const ProductFactoryV2 = require("../services/product.service.v2");

class ProductController {
  // createProduct = async (req, res, next) => {
  //   console.log("req.user", req);
  //   new CREATED({
  //     message: "Create new product success!",
  //     metadata: await ProductFactory.createProduct(req.body.product_type, {
  //       ...req.body,
  //       product_shop: req.user.userId,
  //     }),
  //     options: {
  //       limit: 10,
  //     },
  //   }).send(res);
  // };
  createProduct = async (req, res, next) => {
    new CREATED({
      message: "Create new product success!",
      metadata: await ProductFactoryV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
      options: {
        limit: 10,
      },
    }).send(res);
  };

  // query

  /**
   * @desc Get all Drafts for shop
   * @param {Number} limit
   * @param {Number} skip
   * @return {JSON}
   */
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all drafts for shop success!",
      metadata: await ProductFactoryV2.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
