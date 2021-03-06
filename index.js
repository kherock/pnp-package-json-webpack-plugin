const path = require('path');

const validateOptions = require('schema-utils');
const ExternalModule = require('webpack/lib/ExternalModule');

const schema = require('./schema.json');

class PnpPackageJsonPlugin {
  constructor(options = {}) {
    validateOptions(schema, options);
    const {
      basePackageValues = {
        name: '',
        version: '0.0.0',
        description: '',
        main: 'main.js',
      },
      outputPath = '.',
    } = options;
    this.basePackageValues = basePackageValues;
    this.outputPath = path.posix.join(outputPath, 'package.json');
  }

  apply(compiler) {
    if (!process.versions.pnp) {
      return;
    }
    const pnp = require('pnpapi');

    const dependencies = {};

    compiler.hooks.thisCompilation.tap(
      PnpPackageJsonPlugin.name,
      (compilation) => {
        compilation.hooks.afterOptimizeTree.tap(
          PnpPackageJsonPlugin.name,
          (chunks, modules) => {
            for (const module of modules) {
              if (module instanceof ExternalModule && module.issuer) {
                try {
                  const resolution = pnp.resolveToUnqualified(
                    module.userRequest,
                    module.issuer.context,
                    { considerBuiltins: compiler.options.target === 'node' },
                  );
                  const { name, reference } = pnp.findPackageLocator(
                    pnp.resolveUnqualified(resolution),
                  );
                  if (reference.startsWith('workspace:')) {
                    continue;
                  }
                  dependencies[name] = reference.replace(
                    /(^virtual:\w+#)?(?<=^|#)(npm|commit):/g,
                    '',
                  );
                } catch {}
              }
            }
          },
        );
      },
    );

    compiler.hooks.emit.tapAsync(
      PnpPackageJsonPlugin.name,
      (compilation, callback) => {
        const asset =
          JSON.stringify(
            Object.assign(
              {},
              this.basePackageValues instanceof Function
                ? this.basePackageValues(compilation)
                : this.basePackageValues,
              {
                dependencies,
                devDependencies: undefined,
              },
            ),
            null,
            2,
          ) + '\n';
        compilation.assets[this.outputPath] = {
          source: () => asset,
          size: () => asset.length,
        };
        callback();
      },
    );
  }
}

module.exports = PnpPackageJsonPlugin;
