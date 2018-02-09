'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');
const { ensureXMLDoc } = require('oniyi-utils-xml');

// internal modules
const xpathSelect = require('../xpath-select');
const resultEntryParser = require('./result-entry');

module.exports = (stringOrXMLDoc) => {
  const xmlDoc = ensureXMLDoc(stringOrXMLDoc);

  const result = {
    totalResults: xpathSelect('number(atom:feed/openSearch:totalResults/text())', xmlDoc, true),
    entries: _.map(xpathSelect('/atom:feed/atom:entry', xmlDoc), entryNode => resultEntryParser(entryNode, true)),
  };

  return result;
};
