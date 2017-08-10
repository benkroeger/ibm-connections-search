'use strict';

// node core modules

// 3rd party modules

// internal modules

module.exports = requestCallback => ({
  params: { ttl: {} },
  httpClient: {
    makeRequest: requestCallback,
  },
});
