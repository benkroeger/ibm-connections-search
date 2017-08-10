'use strict';

// node core modules

// 3rd party modules
import test from 'ava';
import _ from 'lodash';

// internal modules
import utils from '../lib/utils';

test('defined \'omitDefaultRequestParams\' method', (t) => {
  t.true(_.isFunction(utils.omitDefaultRequestParams));
});

test('removes default request params', (t) => {
  const defaultParamNames = ['uri', 'url', 'method', 'qs', 'baseUrl'];
  /* beautify preserve:start */
  const params = defaultParamNames.reduce((result, name) =>
    Object.assign(result, { [name]: name }), {});
  /* beautify preserve:end */

  const result = utils.omitDefaultRequestParams(params);

  const intersected = _.intersection(Object.keys(result), defaultParamNames);

  t.is(intersected.length, 0);
});

test('removes params listed in \'extraOmit\' arg', (t) => {
  const extraOmitParamNames = ['foo', 'bar', 'baz'];
  const baseParams = { lorem: 'ipsum' };
  /* beautify preserve:start */
  const params = extraOmitParamNames.reduce((result, name) =>
    Object.assign(result, { [name]: name }), Object.assign({}, baseParams));
  /* beautify preserve:end */

  const result = utils.omitDefaultRequestParams(params, extraOmitParamNames);

  const intersected = _.intersection(Object.keys(result), extraOmitParamNames);

  t.is(intersected.length, 0);
  t.deepEqual(result, baseParams);
});
