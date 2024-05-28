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

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish product success!",
      metadata: await ProductFactoryV2.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Unpublish product success!",
      metadata: await ProductFactoryV2.unPublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
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

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all publish for shop success!",
      metadata: await ProductFactoryV2.findAllPublishForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get product success!",
      metadata: await ProductFactoryV2.getListSearchProduct(req.params),
    }).send(res);
  };

  findAllProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all product for shop success!",
      metadata: await ProductFactoryV2.findAllProduct(req.params),
    }).send(res);
  };

  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get product success!",
      metadata: await ProductFactoryV2.findProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
