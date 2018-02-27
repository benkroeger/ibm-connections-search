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

test.todo('mounts credentials plugin when params available');

test.cb('loads search feed', (t) => {
  const query = { query: 'scherdel' };
  const options = { authType: 'basic' };
  service.search(query, options, (error, { totalResults, entries }) => {
    // console.log(error, results);
    t.ifError(error);
    t.is(totalResults, 240);
    t.true(Array.isArray(entries));
    t.is(entries.length, 10);
    t.end();
  });
});
