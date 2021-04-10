/* eslint-disable import/no-anonymous-default-export */
import dts from 'rollup-plugin-dts';
import pkg from './package.json';
import tsConfig from './tsconfig.json';
import typescript from '@rollup/plugin-typescript';
import fs from 'fs';

const srcDir = 'src';
const apiDir = `${srcDir}/api`;
const tsOutDir = tsConfig.compilerOptions.outDir;

const input = [`${srcDir}/index.ts`];

fs.readdirSync(apiDir).forEach((fileName) => {
  input.push(`${apiDir}/${fileName}`);
});

function createCommonJSConfig(outDir) {
  return {
    input: input[0],
    output: [{ file: pkg.main, format: 'cjs', exports: 'named' }],
    external: ['react'],
    plugins: [typescript({ outDir, declaration: false })],
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
    plugins: [typescript({ outDir, declaration: false })],
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
  createCommonJSConfig('lib'),
  createModuleConfig('lib'),
  createDeclarationConfig(),
];
