var isCommonJS = typeof window == "undefined";

/**
 * Top level namespace for Jasmine, a lightweight JavaScript BDD/spec/testing framework.
 *
 * @namespace
 */
var jasmine = {};
if (isCommonJS) exports.jasmine = jasmine;
/**
 * @private
 */
jasmine.version_= {
  "major": 1,
  "minor": 2,
  "build": 0,
  "revision": 1337005947
};
