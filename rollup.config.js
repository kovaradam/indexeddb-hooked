/* eslint-disable import/no-anonymous-default-export */
import dts from 'rollup-plugin-dts';
import pkg from './package.json';
import tsConfig from './tsconfig.json';
import typescript from '@rollup/plugin-typescript';

const srcDir = 'src';
const tsOutDir = tsConfig.compilerOptions.outDir;

const input = [
  `${srcDir}/index.ts`,
  `${srcDir}/hooks/use-read.ts`,
  `${srcDir}/hooks/use-update.ts`,
  `${srcDir}/operators/read.ts`,
  `${srcDir}/operators/update.ts`,
];

function createCommonJSConfig(outDir) {
  return {
    input,
    output: [{ dir: outDir, format: 'cjs', exports: 'named' }],
    external: ['react'],
    plugins: [typescript({ outDir })],
  };
}

function createModuleConfig(outDir) {
  return {
    input,
    onwarn: function (warning) {
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return;
      }
      console.warn(warning.message);
    },
    output: [{ dir: outDir, format: 'es' }],
    external: ['react'],
    plugins: [typescript({ outDir })],
  };
}

function createDeclarationConfig() {
  return {
    input: `${tsOutDir}/index.d.ts`,
    output: {
      file: pkg.types,
    },
    plugins: [dts()],
  };
}

export default [
  createCommonJSConfig('lib/cjs'),
  createModuleConfig('lib/esm'),
  createDeclarationConfig(),
];
