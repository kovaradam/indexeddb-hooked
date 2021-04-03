/* eslint-disable import/no-anonymous-default-export */
import dts from 'rollup-plugin-dts';
import pkg from './package.json';
import tsconfig from './tsconfig.json';

const tsOutDir = tsconfig.compilerOptions.outDir;

export default [
  {
    input: [
      `${tsOutDir}/index.js`,
      `${tsOutDir}/hooks/use-read.js`,
      `${tsOutDir}/hooks/use-update.js`,
      `${tsOutDir}/operators/read.js`,
      `${tsOutDir}/operators/update.js`,
    ],
    output: [
      // { file: pkg.main, format: 'cjs' },
      // { file: pkg.module, format: 'es' },
      { dir: 'lib/esm', format: 'es' },
      { dir: 'lib/cjs', format: 'cjs', exports: 'named' },
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
    input: `${tsOutDir}/index.js`,
    output: {
      file: pkg.types,
    },
    plugins: [dts()],
  },
];
