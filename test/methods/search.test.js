'use strict';

// node core modules
import fs from 'fs';
import path from 'path';

// 3rd party modules
import test from 'ava';

// internal modules
import { search } from '../../lib/methods/search';
import mockService from './fixtures/mock-service';

const xmlString = fs.readFileSync(path.resolve(__dirname, './fixtures/results-feed.xml'), { encoding: 'utf8' });

test.cb('makes request and parses succesful response', (t) => {
  const response = {
    statusCode: 200,
    headers: {
      'content-type': 'application/atom+xml',
    },
  };
  const body = xmlString;
  const requestCallback = (options, callback) => {
    callback(null, response, body);
  };
  const service = mockService(requestCallback);

  const query = {};
  const options = {};
  search.call(service, query, options, (error, result) => {
    t.ifError(error);
    t.true(Array.isArray(result));
    t.is(result.length, 4);
    t.end();
  });
});

test.cb('aborts when callback invoked with error object', (t) => {
  const requestError = new Error();
  const requestCallback = (options, callback) => {
    callback(requestError);
  };
  const service = mockService(requestCallback);

  const query = {};
  const options = {};
  search.call(service, query, options, (error) => {
    t.is(error, requestError);
    t.end();
  });
});

test.cb('aborts when response object is missing', (t) => {
  const requestCallback = (options, callback) => {
    callback(null, null);
  };
  const service = mockService(requestCallback);

  const query = {};
  const options = {};
  search.call(service, query, options, (error) => {
    t.is(error.message, 'response object is missing');
    t.end();
  });
});

test.cb('aborts when response.headers object is missing', (t) => {
  const requestCallback = (options, callback) => {
    callback(null, {});
  };
  const service = mockService(requestCallback);

  const query = {};
  const options = {};
  search.call(service, query, options, (error) => {
    t.is(error.message, 'response.headers object is missing');
    t.end();
  });
});

test.cb('aborts when response.statusCode !== 200', (t) => {
  const response = {
    statusCode: false,
    headers: {
      'content-type': 'application/atom+xml',
    },
  };
  const requestCallback = (options, callback) => {
    callback(null, response);
  };
  const service = mockService(requestCallback);

  const query = {};
  const options = {};
  search.call(service, query, options, (error) => {
    t.is(error.message, 'received response with unexpected status code');
    t.end();
  });
});

test.cb('aborts when contentType is not application/atom+xml', (t) => {
  const response = {
    statusCode: 200,
    headers: {
      'content-type': 'text',
    },
  };
  const requestCallback = (options, callback) => {
    callback(null, response);
  };
  const service = mockService(requestCallback);

  const query = {};
  const options = {};
  search.call(service, query, options, (error) => {
    t.true(error.message.startsWith('received response with unexpected content-type'));
    t.end();
  });
});
