'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');

// internal modules

const omitDefaultRequestParams = (params, extraOmit = []) =>
  _.omit(params, ['uri', 'url', 'method', 'qs', 'baseUrl', ...extraOmit]);

module.exports = { omitDefaultRequestParams };
