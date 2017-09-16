import resolve from "rollup-plugin-node-resolve"
import babel from "rollup-plugin-babel"
import babelrc from "babelrc-rollup"
import butternut from "rollup-plugin-butternut"
import replace from "rollup-plugin-replace"
// `yarn example` and babel plugin external-helpers is conflict

// older Compression way, it set `uglify({}, minify)` to `plugins`
// import uglify from 'rollup-plugin-uglify'
// import { minify } from 'uglify-es'

const pgk = require("./package.json")
const isPro = process.env.NODE_ENV === "production"
const babelConfig = babelrc({
  config: pgk.babel,
  // use babel-plugin-external-helpers,it set `true` to enable log unused modules.
  //addExternalHelpersPlugin: false,
})

export default {
  input: "src/index.js",
  output: {
    file: `dist/glaive${isPro ? ".min" : ""}.js`,
    // options: amd, cjs, es, iife, umd
    format: "umd",
    name: "glaive",
    sourcemap: true,
    banner: `/* ${pgk.name} version ${pgk.version} */`,
    footer: `/* follow ${pgk.name} on Github! ${pgk.repository.url} */`,
  },
  plugins: [
    resolve(),
    babel(babelConfig),
    isPro && butternut(),
    replace({
      ENV: JSON.stringify(process.env.NODE_ENV || "development"),
    }),
  ],
}
