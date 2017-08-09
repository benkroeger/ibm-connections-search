'use strict';

// node core modules

// 3rd party modules
import test from 'ava';

// internal modules
import { mock, record, persist } from './fixtures/http-mocking';
import serviceFactory from '../lib';

const { unmocked } = process.env;

const serviceOptions = { defaults: {} };
if (unmocked) {
  Object.assign(serviceOptions.defaults, {
    auth: {
      user: process.env.username,
      pass: process.env.password,
    },
  });
}
const service = serviceFactory('https://lc.gish.de/search/', serviceOptions);

test.before(() => (unmocked ? record() : mock()));
test.after(() => unmocked && persist());

test.cb('loads search feed', (t) => {
  const query = { query: 'scherdel' };
  const options = { authType: 'basic' };
  service.search(query, options, (error, results) => {
    // console.log(error, results);
    t.ifError(error);
    t.true(Array.isArray(results));
    t.is(results.length, 10);
    t.end();
  });
});
