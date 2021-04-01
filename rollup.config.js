/* eslint-disable import/no-anonymous-default-export */
import dts from 'rollup-plugin-dts';
import pkg from './package.json';
import tsconfig from './tsconfig.json';

export default [
  {
    input: `${tsconfig.compilerOptions.outDir}/index.js`,
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
    external: ['react'],
    onwarn: function (warning) {
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return;
      }
      console.warn(warning.message);
    },
  },
  {
    input: `${tsconfig.compilerOptions.outDir}/index.js`,
    output: {
      file: pkg.types,
    },
    plugins: [dts()],
  },
];
