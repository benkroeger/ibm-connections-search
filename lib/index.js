'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');
const OniyiHttpClient = require('oniyi-http-client');
const credentialsPlugins = require('oniyi-http-plugin-credentials');
const formatUrlTemplatePlugin = require('oniyi-http-plugin-format-url-template');

// internal modules
const methods = require('./methods');

/**
 * [exports description]
 * @method exports
 * @param  {String} baseUrl     the base url to reach an IBM Connections Blogs application
 *                              e.g. `https://apps.na.collabserv.com/blogs/`
 * @param  {Object} [params={}] [description]
 * @return {[type]}             [description]
 */
module.exports = (baseUrl, params = {}) => {
  _.merge(params, {
    defaults: {
      authType: '',
      baseUrl: (baseUrl.endsWith('/') && baseUrl) || `${baseUrl}/`,
    },
    ttl: {},
  });

  const httpClient = new OniyiHttpClient(params);

  const { plugins = {} } = params;
  if (plugins.credentials) {
    httpClient.use(credentialsPlugins(plugins.credentials));
  }

  const formatUrlTemplateOptions = _.merge({
    valuesMap: {
      authType: {
        '': 'atom/search',
        none: 'atom/search',
        oauth: 'oauth/atom/mysearch',
        basic: 'atom/mysearch',
        saml: 'atomfba/mysearch',
        cookie: 'atomfba/mysearch',
      },
    },
  }, plugins.formatUrlTemplate || {});

  httpClient.use(formatUrlTemplatePlugin(formatUrlTemplateOptions));

  const service = {};

  // the following defineProperty() options are used with their default value `false`
  // configurable: false, enumerable: false, writable: false
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
  Object.defineProperty(service, 'params', { value: params });
  Object.defineProperty(service, 'httpClient', { value: httpClient });

  Object.assign(service, methods);

  return service;
};
