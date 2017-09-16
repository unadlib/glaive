import resolve from "rollup-plugin-node-resolve"
import babel from "rollup-plugin-babel"
import babelrc from "babelrc-rollup"
import butternut from "rollup-plugin-butternut"
import replace from "rollup-plugin-replace"

// older Compression way, it set `uglify({}, minify)` to `plugins`
// import uglify from 'rollup-plugin-uglify'
// import { minify } from 'uglify-es'

const pgk = require("./package.json")
const isPro = process.env.NODE_ENV === "production"

export default {
  input: "src/index.js",
  output: {
    file: `dist/glaive${isPro ? ".min" : ""}.js`,
    format: "umd", // options: amd, cjs, es, iife, umd
    name: "glaive",
    sourcemap: true,
    banner: `/* ${pgk.name} version ${pgk.version} */`,
    footer: `/* follow ${pgk.name} on Github! ${pgk.repository.url} */`,
  },
  plugins: [
    resolve(),
    babel(
      babelrc({
        config: pgk.babel,
        // use babel-plugin-external-helpers,it set `true` to enable log unused modules.
        //addExternalHelpersPlugin: false,
      }),
    ),
    isPro && butternut(),
    replace({
      ENV: JSON.stringify(process.env.NODE_ENV || "development"),
    }),
  ],
}
