module.exports = function(api) {
  api.cache(true);

  return {
    "presets": [
      ["@babel/preset-env",
       {
        "targets": {
          "node": 14
        }
       }
      ],
      "@babel/preset-typescript"
    ],
    "plugins": [
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      ["@babel/plugin-proposal-class-properties"],
      ["module-resolver", {
        "alias": {
          "mu": "/usr/src/output/helpers/mu/index.js"
        }
      }]
    ],
    "ignore": [
      "./app/node_modules"
    ]
  };
};
