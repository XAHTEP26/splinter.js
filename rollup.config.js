import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

const isProd = process.env.NODE_ENV === 'production';

const plugins = [
  resolve(),
  babel({
    exclude: 'node_modules/**',
    babelrc: false,
    presets: [['@babel/env', { modules: false }]]
  }),
  commonjs({
    sourceMap: false
  })
];

isProd && plugins.push(uglify());

export default {
  input: 'index.js',
  output: {
    file: `build/splinter${isProd ? '.min' : ''}.js`,
    format: 'umd',
    name: 'Splinter'
  },
  plugins
};
