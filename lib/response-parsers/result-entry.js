'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');
const { ensureXMLDoc, parseXMLNode } = require('oniyi-utils-xml');

// internal modules
const xpath = require('../xpath-select');

const linkRelToNameMap = {
  via: 'api',
  '': 'webview',
  alternate: 'webview',
  'http://www.ibm.com/xmlns/prod/sn/container': 'container',
};

const toDate = val => val && Date.parse(val);

const parseUserInfo = node =>
  parseXMLNode(
    node,
    {
      name: 'string(atom:name/text())',
      userId: 'string(snx:userid/text())',
      state: 'string(snx:userState/text())',
      email: 'string(atom:email/text())',
      external: 'boolean(snx:isExternal/text())',
    },
    xpath
  );

const parseLinks = nodes =>
  _.reduce(
    nodes,
    (result, node) => {
      const link = parseXMLNode(
        node,
        {
          rel: 'string(@rel)',
          type: 'string(@type)',
          href: 'string(@href)',
        },
        xpath
      );
      const { [link.rel || '']: name } = linkRelToNameMap;
      return Object.assign(result, { [name]: link });
    },
    {}
  );

const resultEntrySelectors = {
  id: 'string(atom:id/text())',
  title: 'string(atom:title/text())',
  primaryComponent:
    'string(atom:category[@scheme="http://www.ibm.com/xmlns/prod/sn/component" and ibmsc:field[@id="primaryComponent" and text()="true"]]/@term)',
  containerType: 'string(ibmsc:field[@id="container_type"]/text())',
  communityUuid: 'string(snx:communityUuid/text())',
  docType: 'string(atom:category[@scheme="http://www.ibm.com/xmlns/prod/sn/doctype"]/@term)',
  updated: { selector: 'string(atom:updated/text())', transform: toDate },
  summaryType: 'string(atom:summary/@type)',
  summary: 'string(atom:summary/text())',
  relevance: 'string(relevance:score/text())',
  components: {
    selector: 'atom:category[@scheme="http://www.ibm.com/xmlns/prod/sn/component" and @term]',
    multi: true,
    transform: nodes => _.map(nodes, node => node.getAttribute('term')),
  },
  tags: {
    selector: 'atom:category[@term and not(@scheme)]',
    multi: true,
    transform: nodes => _.map(nodes, node => node.getAttribute('term')),
  },
  author: { selector: 'atom:author', transform: parseUserInfo },
  links: { selector: 'atom:link', transform: parseLinks, multi: true },
};

module.exports = (stringOrXMLDoc, isEntryNode) => {
  const xmlDoc = ensureXMLDoc(stringOrXMLDoc);
  const entryNode = isEntryNode ? xmlDoc : xpath('atom:entry', xmlDoc, true);

  const result = parseXMLNode(entryNode, resultEntrySelectors, xpath);

  return result;
};
