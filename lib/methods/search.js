'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');

// internal modules
const responseParser = require('../response-parsers/results-feed');
const { omitDefaultRequestParams } = require('../utils');

const validQueryParams = [
  'locale',
  'query',
  'queryLang',
  'start',
  'page',
  'pageSize',
  'scope',
  'social',
  'sortKey',
  'sortOrder',
  'constraint',
  'notconstraint',
  'facet',
  'includeField',
  'evidence',
  'highlight',
];

/**
 * Search IBM Connections to find content that, for example, contains a specific text string in its title or content, or is tagged with a specific tag.
 * @method search
 * @param  {Object}     query
 * @param  {String}     query.query     Text to search for. Returns a list of results with the specified text in the title, description, or content. Encode the strings. By default, spaces are treated as an AND operator. The following operators are supported:
 *                                      AND or &&: Searches for items that contain both words. For example: query=red%20AND%20test returns items that contain both the word red and the word test. AND is the default operator.
 *                                      NOT or !: Excludes the word that follows the operator from the search. For example: query=test%20NOT%20red returns items that contain the word test, but not the word red.
 *                                      OR: Searches for items that contain either of the words. For example: query=test%20OR%20red
 *                                      To search for a phrase, enclose the phrase in quotation marks (" ").
 *                                      +: The plus sign indicates that the word must be present in the result. For example: query=+test%20red returns only items that contain the word test and many that also contain red, but none that contain only the word red.
 *                                      ?: Use a question mark to match individual characters. For example: query=te%3Ft returns items that contain the words test, text, tent, and others that begin with te.
 *                                      -: The dash prohibits the return of a given word. This operator is similar to NOT. For example: query=test%20-red returns items that contains the word test, but not the word red.
 *                                      Note: Wildcard searches are permitted, but wildcard only searches (*) are not.
 *                                      For more details about supported operators, see Advanced search options in the Using section of the product documentation.
 * @param  {Object}     options         Any options you want to pass to `httpClient.makeRequest()`
 *                                      https://github.com/request/request#requestoptions-callback
 * @param  {Function}   [callback]      [description]
 * @return {Promise}                    If no callback is provided, this method returns a Promise
 */
function search(query, options, callback) {
  const { httpClient, params } = this;
  // construct the request options
  const requestOptions = _.merge(
    {
      // defining defaults in here
      qs: {
        pageSize: 10, // max is 150
      },
      authType: 'none',
    },
    omitDefaultRequestParams(options),
    {
      qs: _.pick(query, validQueryParams),
      headers: {
        accept: 'application/atom+xml',
      },
      ttl: params.ttl.searchResult,
      uri: '{ authType }/results',
    }
  );

  httpClient.makeRequest(requestOptions, (requestError, response, body) => {
    if (requestError) {
      callback(requestError);
      return;
    }

    if (!response) {
      const error = new Error('response object is missing');
      error.httpStatus = 500;
      callback(error);
      return;
    }

    if (!response.headers) {
      const error = new Error('response.headers object is missing');
      error.httpStatus = 500;
      callback(error);
      return;
    }

    const { statusCode, headers: { 'content-type': contentType } } = response;
    // expexted
    // status codes: 200, 403, 404
    // content-type: application/atom+xml
    if (statusCode !== 200) {
      const error = new Error(body || 'received response with unexpected status code');
      error.httpStatus = statusCode;
      callback(error);
      return;
    }

    if (!contentType.startsWith('application/atom+xml')) {
      const error = new Error(`received response with unexpected content-type ${contentType}`);
      error.httpStatus = 401; // IBM Connections typically responds with httpStatus 200 and the login page if a user is not authenticated
      callback(error);
      return;
    }

    callback(null, responseParser(body));
  });
}

module.exports = { search };
