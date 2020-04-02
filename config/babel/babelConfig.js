const path = require('path');
const { cwd } = require('../../lib/cwd');

module.exports = ({
  target,
  lang = 'js',
  supportedBrowsers,
  displayNamesProd = false,
}) => {
  const browserEnvOptions = {
    modules: false,
    targets: supportedBrowsers,
  };

  const nodeEnvOptions = {
    targets: {
      node: 'current',
    },
  };

  const isBrowser = target === 'browser';
  const isJest = target === 'jest';

  const envPresetOptions = {
    useBuiltIns: 'usage',
    bugfixes: true,
    corejs: {
      version: 3,
      proposals: true,
    },
    ...(isBrowser ? browserEnvOptions : nodeEnvOptions),
  };

  const plugins = [
    require.resolve('babel-plugin-syntax-dynamic-import'),
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-proposal-object-rest-spread'),
    require.resolve('@babel/plugin-proposal-optional-chaining'),
    require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
    [
      require.resolve('babel-plugin-module-resolver'),
      { root: [cwd()], extensions: ['.mjs', '.js', '.json', '.ts', '.tsx'] },
    ],
    require.resolve('babel-plugin-macros'),
    require.resolve('@loadable/babel-plugin'),
    [require.resolve('babel-plugin-treat'), { alias: 'sku/treat' }],
  ];

  if (isBrowser) {
    // Transform runtime needs info about versions installed to be more efficient
    const { version } = require('@babel/runtime/package.json');
    const absoluteRuntime = path.dirname(
      require.resolve('@babel/runtime/package.json'),
    );

    const transformRuntime = [
      require.resolve('@babel/plugin-transform-runtime'),
      {
        useESModules: true,
        absoluteRuntime,
        version,
      },
    ];

    plugins.push(
      transformRuntime,
      require.resolve('babel-plugin-seek-style-guide'),
    );
  }

  if (isJest) {
    plugins.push(require.resolve('babel-plugin-dynamic-import-node'));
  }

  if (process.env.NODE_ENV === 'production') {
    plugins.push(
      require.resolve('@babel/plugin-transform-react-inline-elements'),
      require.resolve('babel-plugin-transform-react-remove-prop-types'),
      require.resolve('@babel/plugin-transform-react-constant-elements'),
    );

    if (displayNamesProd) {
      plugins.push(require.resolve('babel-plugin-add-react-displayname'));
    }
  }

  const languagePreset =
    lang === 'ts'
      ? [
          require.resolve('@babel/preset-typescript'),
          {
            isTSX: true,
            allExtensions: true,
          },
        ]
      : require.resolve('@babel/preset-flow');

  return {
    babelrc: false,
    sourceType: isBrowser ? 'unambiguous' : 'module',
    presets: [
      languagePreset,
      [require.resolve('@babel/preset-env'), envPresetOptions],
      require.resolve('@babel/preset-react'),
    ],
    plugins,
  };
};
