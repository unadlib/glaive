// import babelrc from "babelrc-rollup"
// TODO Enable Karma for rollup and supported ES2015

module.exports = function(config) {
  config.set({
    basePath: "",
    frameworks: ["mocha", "chai"],
    files: ["__tests__/*.js"],
    exclude: [],
    preprocessors: {
      "__tests__/*.js": ["rollup"],
    },
    rollupPreprocessor: {
      plugins: [
        // require('rollup-plugin-commonjs')(),
        require("rollup-plugin-node-resolve")(),
        require("rollup-plugin-replace")({
          "process.env.NODE_ENV": JSON.stringify("production"),
        }),
        require("rollup-plugin-babel")({
          exclude: "dist/**",
        }),
      ],
      format: "umd",
    },
    reporters: ["progress"],
    port: 9527,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ["ChromeHeadless"],
    autoWatch: false,
    // singleRun: false,
    concurrency: Infinity,
  })
}
