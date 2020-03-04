module.exports = function(api) {
  if(api.env("development")){
    return {
      "presets": [
        ["@babel/preset-env",{
          "targets": {
            "node": 12
          }
        }]
      ],
      "plugins": [
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose" : true }],
        ["module-resolver", {
          "alias": {
            "mu": "/usr/src/app/helpers/mu/index.js"
          }
        }]
      ]
    };
  }
  else{
    return {
      "presets": [
        ["@babel/preset-env",{
          "targets": {
            "node": 12
          }
        }]
      ],
      "plugins": [
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose" : true }],
        ["module-resolver", {
          "alias": {
            "mu": "/usr/src/app/prod/helpers/mu/index.js"
          }
        }]
      ]
    };
  }
}