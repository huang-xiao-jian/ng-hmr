/**
 * @description - observable package rollup configuration
 * @author - bornkiller <hjj491229492@hotmail.com>
 */
import eslint from 'rollup-plugin-eslint';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import ngAnnotate from 'rollup-plugin-ng-annotate';
import babel from 'rollup-plugin-babel';

export default {
  entry: 'index.js',
  moduleId: 'ng_hmr',
  moduleName: 'ng_hmr',
  plugins: [
    eslint({
      include: ['index.js', 'src/*.js']
    }),
    nodeResolve({jsnext: true, module: true}),
    commonjs({
      include: ['node_modules/@bornkiller/**']
    }),
    ngAnnotate(),
    babel()
  ],
  external: ['angular', 'lodash'],
  globals: {
    angular: 'angular',
    lodash: '_'
  },
  targets: [
    {format: 'iife', dest: 'dist/ng-hmr.js'},
    {format: 'es', dest: 'dist/ng-hmr.next.js'}
  ]
};