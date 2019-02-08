const { supportedBrowsers } = require('../../context');
const { cwd } = require('../../lib/cwd');

const browserEnvOptions = {
  modules: false,
  targets: supportedBrowsers
};

const nodeEnvOptions = {
  targets: {
    node: 'current'
  }
};

module.exports = ({ target, lang = 'js' }) => {
  const isBrowser = target === 'browser';

  const envPresetOptions = isBrowser ? browserEnvOptions : nodeEnvOptions;
  const plugins = [
    require.resolve('babel-plugin-syntax-dynamic-import'),
    require.resolve('babel-plugin-flow-react-proptypes'),
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-proposal-object-rest-spread'),
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: [cwd()],
        extensions: ['.mjs', '.js', '.json', '.ts', '.tsx']
      }
    ],
    require.resolve('@babel/plugin-transform-runtime'),
    require.resolve('babel-plugin-macros'),
    require.resolve('@loadable/babel-plugin')
  ];

  if (isBrowser) {
    plugins.push(require.resolve('babel-plugin-seek-style-guide'));
  }

  if (process.env.NODE_ENV === 'production') {
    plugins.push(
      require.resolve('@babel/plugin-transform-react-inline-elements'),
      require.resolve('babel-plugin-transform-react-remove-prop-types'),
      require.resolve('@babel/plugin-transform-react-constant-elements')
    );
  }

  const languagePreset =
    lang === 'ts'
      ? [
          require.resolve('@babel/preset-typescript'),
          {
            isTSX: true,
            allExtensions: true
          }
        ]
      : require.resolve('@babel/preset-flow');

  return {
    babelrc: false,
    presets: [
      languagePreset,
      [require.resolve('@babel/preset-env'), envPresetOptions],
      require.resolve('@babel/preset-react')
    ],
    plugins
  };
};
