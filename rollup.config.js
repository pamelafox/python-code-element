import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

import pkg from './package.json';

export default {
  input: 'src/code-exercise.js',
  output: {
    name: 'CodeExerciseElement',
    file: pkg.browser,
    format: 'umd',
  },
  plugins: [
    webWorkerLoader(/* configuration */),
    resolve(),
    terser({
      ecma: 2021,
      module: true,
      warnings: true,
      mangle: {
        properties: {
          regex: /^__/,
        },
      },
    }),
	copy({
		targets: [{src: 'src/worker.js', dest: 'dist/'}],
	}),
  ],
};
