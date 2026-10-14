# Vexa web app build status

Build step outcome: success

## Recent build output
```text
yarn install v1.22.22
[1/4] Resolving packages...
[2/4] Fetching packages...
[3/4] Linking dependencies...
warning " > react-lottie@1.2.3" has incorrect peer dependency "react@^0.14.7 || ^15.0.0 || ^16.0.0".
warning " > optimize-css-assets-webpack-plugin@5.0.4" has incorrect peer dependency "webpack@^4.0.0".
warning "webpack-dev-server > webpack-dev-middleware@3.7.2" has incorrect peer dependency "webpack@^4.0.0".
warning Workspaces can only be enabled in private projects.
warning Workspaces can only be enabled in private projects.
[4/4] Building fresh packages...
Done in 23.77s.
yarn run v1.22.22
$ webpack --config config/webpack.prod.js
(node:2501) [DEP0148] DeprecationWarning: Use of deprecated folder mapping "./" in the "exports" field module resolution of the package at /tmp/vexa-zip-inspect/discord-clone-main/frontend/node_modules/postcss/package.json.
Update this package.json to use a subpath pattern like "./*".
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:2501) [DEP_WEBPACK_COMPILATION_OPTIMIZE_CHUNK_ASSETS] DeprecationWarning: optimizeChunkAssets is deprecated (use Compilation.hook.processAssets instead and use one of Compilation.PROCESS_ASSETS_STAGE_* as stage option)
Browserslist: caniuse-lite is outdated. Please run:
npx browserslist@latest --update-db

Why you should do it regularly:
https://github.com/browserslist/browserslist#browsers-data-updating
(node:2501) [DEP0148] DeprecationWarning: Use of deprecated folder mapping "./" in the "exports" field module resolution of the package at /tmp/vexa-zip-inspect/discord-clone-main/frontend/node_modules/css-loader/node_modules/postcss/package.json.
Update this package.json to use a subpath pattern like "./*".
Browserslist: caniuse-lite is outdated. Please run:
npx browserslist@latest --update-db

Why you should do it regularly:
https://github.com/browserslist/browserslist#browsers-data-updating

warn - The `target` feature has been removed in Tailwind CSS v2.0.
warn - Please remove this option from your config file to silence this warning.
Browserslist: caniuse-lite is outdated. Please run:
npx browserslist@latest --update-db

Why you should do it regularly:
https://github.com/browserslist/browserslist#browsers-data-updating
(node:2501) [DEP_WEBPACK_COMPILATION_ASSETS] DeprecationWarning: Compilation.assets will be frozen in future, all modifications are deprecated.
BREAKING CHANGE: No more changes should happen to Compilation.assets after sealing the Compilation.
	Do changes to assets earlier, e. g. in Compilation.hooks.processAssets.
	Make sure to select an appropriate stage from Compilation.PROCESS_ASSETS_STAGE_*.
assets by path assets/*.svg 890 KiB 48 assets
assets by info 11.6 MiB [immutable]
  assets by status 11.5 MiB [big] 3 assets
  assets by path *.png 9.56 KiB 3 assets
  asset js/runtime.2cf7acf6d00a6f8e9d2a.bundle.js 1.26 KiB [emitted] [immutable] [minimized] (name: runtime)
assets by path assets/*.png 459 KiB
  asset assets/login_bg.png 450 KiB [emitted] [from: src/assets/login_bg.png] [copied]
  asset assets/new_line.png 6.08 KiB [emitted] [from: src/assets/new_line.png] [copied]
  asset assets/qr_code.png 3.19 KiB [emitted] [from: src/assets/qr_code.png] [copied]
  asset assets/usa_flag.png 288 bytes [emitted] [from: src/assets/usa_flag.png] [copied]
asset assets/lottie/start-chatting.json 520 KiB [emitted] [from: src/assets/lottie/start-chatting.json] [copied] [big]
asset assets/icons/favicon.png 39 KiB [emitted] [from: src/assets/icons/favicon.png] [copied]
asset favicon.png 39 KiB [emitted]
asset index.html 564 bytes [emitted]
Entrypoint main [big] 11.6 MiB (9.56 KiB) = js/runtime.2cf7acf6d00a6f8e9d2a.bundle.js 1.26 KiB main.da83eb214cfe0baf0cb3.css 4.82 MiB styles/main.da83eb214cfe0baf0cb3.css 4.82 MiB js/main.22d3ebd1da9110dd51a1.bundle.js 1.92 MiB 3 auxiliary assets
orphan modules 1.66 MiB [orphan] 349 modules
runtime modules 3.54 KiB 7 modules
modules by path ./node_modules/ 1.81 MiB 461 modules
modules by path ./src/ 1.59 MiB (javascript) 9.56 KiB (asset) 4.97 MiB (css/mini-extract)
  cacheable modules 1.59 MiB (javascript) 9.56 KiB (asset)
    ./src/index.js + 315 modules 1.59 MiB [built] [code generated]
    ./src/assets/qr_code.png 42 bytes (javascript) 3.19 KiB (asset) [built] [code generated]
    ./src/assets/usa_flag.png 42 bytes (javascript) 288 bytes (asset) [built] [code generated]
    ./src/assets/new_line.png 42 bytes (javascript) 6.08 KiB (asset) [built] [code generated]
  css modules 4.97 MiB
    css ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].use[3]!./src/index.scss 4.97 MiB [code generated]
    css ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].use[3]!./src/app.styles.scss 1.54 KiB [code generated]
webpack 5.17.0 compiled successfully in 112518 ms
Done in 114.41s.
```
