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
  },
  {
    input: `${tsconfig.compilerOptions.outDir}/index.js`,
    output: {
      file: pkg.types,
    },
    plugins: [dts()],
  },
];
