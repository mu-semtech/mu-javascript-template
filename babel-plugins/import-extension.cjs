// Wraps babel-plugin-add-import-extension so JSON imports keep working.
//
// add-import-extension appends `.js` to every relative import which doesn't
// already end in `.js`, turning `import config from './config/config.json'`
// into an import of `./config/config.json.js`.  Native ES modules furthermore
// require JSON to be imported with an import attribute.
//
// JSON imports are therefore left as is, and `with { type: "json" }` is added
// when no attributes were given.  All other imports are handled by
// add-import-extension.
const { types: t } = require('@babel/core');
const addImportExtension = require('babel-plugin-add-import-extension');

const isJsonModule = (source) => !!source && source.value.endsWith('.json');

function addJsonAttribute(node) {
  if (node.attributes && node.attributes.length) return;
  node.attributes = [t.importAttribute(t.identifier('type'), t.stringLiteral('json'))];
}

module.exports = function (api, options, dirname) {
  const plugin = addImportExtension(api, options, dirname);
  const visitor = {};
  for (const [type, visit] of Object.entries(plugin.visitor)) {
    visitor[type] = function (path, state) {
      if (isJsonModule(path.node.source)) {
        addJsonAttribute(path.node);
      } else {
        visit.call(this, path, state);
      }
    };
  }
  return { ...plugin, name: 'mu-import-extension', visitor };
};
