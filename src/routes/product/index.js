"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

router.get(
  "/search/:keySearch",
  asyncHandler(productController.getListSearchProduct)
);
router.get("", asyncHandler(productController.findAllProduct));
router.get("/:product_id", asyncHandler(productController.findProduct));

router.use(authentication);

router.post("", asyncHandler(productController.createProduct));
router.post(
  "/publish/:id",
  asyncHandler(productController.publishProductByShop)
);
router.post(
  "/unpublish/:id",
  asyncHandler(productController.unPublishProductByShop)
);
// query
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));
router.get(
  "/publish/all",
  asyncHandler(productController.getAllPublishForShop)
);

module.exports = router;
