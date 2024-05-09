"use strict";

const _ = require("lodash");

const getInfoData = ({ fileds = [], object = [] }) => {
  return _.pick(object, fileds);
};

module.exports = {
  getInfoData,
};

// middleware => guard => intercerptor (pre) => pipes => controller => interceptor (post) => exception filter
