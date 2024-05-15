"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const ProductFactory = require("../services/product.service");

class ProductController {
  createProduct = async (req, res, next) => {
    console.log("req.user", req);
    new CREATED({
      message: "Create new product success!",
      metadata: await ProductFactory.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
      options: {
        limit: 10,
      },
    }).send(res);
  };
}

module.exports = new ProductController();
