<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
  <h1>Plug'n'Play package.json webpack plugin</h1>
  <p>A webpack plugin to generate a package.json file with external modules as dependencies</p>
  <small>Inspired by <a href="https://github.com/lostpebble/generate-package-json-webpack-plugin">generate-package-json-webpack-plugin</a>
</div>

<h2 align="center">Install</h2>

```bash
yarn add --dev pnp-package-json-webpack-plugin
```

<h2 align="center">Usage</h2>

This plugin generates a package.json asset from modules marked in
[`externals`](https://webpack.js.org/configuration/externals/) with pinned
versions using resolutions from the
[PnP API](https://yarnpkg.com/advanced/pnpapi). This allows for lightweight,
mostly-stable builds in Yarn workspace environments.

In your webpack configuration:

```javascript
const PnpPackageJsonPlugin = require('pnp-package-json-webpack-plugin');

const basePackageValues = {
  name: 'my-nodejs-module',
  version: '1.0.0',
  main: './index.js',
  engines: {
    node: '>= 14.0.0',
  },
};

module.exports = {
  // ...
  plugins: [
    new PnpPackageJsonPlugin({
      basePackageValues,
    }),
  ],
};
```

Please be aware that the file created should not be viewed as a replacement for
a lockfile such as `yarn.lock`. The version of each external pinned by the
plugin will be stable, but it offers no control over child dependencies
installed later.

<h2 align="center">Configuration</h2>

### `basePackageValues`

Type: `Object|Function`
Default:
```json
{
  "name": "",
  "version": "0.0.0",
  "description": "",
  "main": "main.js"
}
```

Specifies an object or function customizing the outputted package.json.

#### `Object`

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new PnpPackageJsonPlugin({
      basePackageValues: {
        name: 'my-app',
        version: '1.0.0',
        main: 'out.js',
      };
    }),
  ],
};
```

#### `Function`

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new PnpPackageJsonPlugin({
      basePackageValues(compilation) {
        const { runtimeChunk } = compilation.entrypoints.get('my-app');
        return {
          name: 'my-app',
          version: '1.0.0',
          main: runtimeChunk.files[0],
        };
      },
    }),
  ],
};
```

### `outputPath`

Type: `String`
Default: `.`

Specifies a filesystem path where the generated package.json will be placed.

**webpack.config.js**

```js
module.exports = {
  plugins: [
    new PnpPackageJsonPlugin({
      // plugin will generate <output.path>/package/package.json
      outputPath: 'package',
    }),
  ],
};
```
