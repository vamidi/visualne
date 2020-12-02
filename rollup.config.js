import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from "rollup-plugin-terser";
import { eslint } from 'rollup-plugin-eslint';

// const path = require('path');

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const production = !process.env.ROLLUP_WATCH;
const bundle = 'visualne'

module.exports = {
    // mode: 'development',
    input: 'src/index.ts',
    output: [
        {
            name: 'VisualNE',
            sourceMap: true,
            file: `dist/${bundle}.min.js`,
            format: 'umd'
        },
        {
            sourceMap: true,
            file: `dist/${bundle}.common.js`,
            format: 'cjs'
        },
        {
            sourceMap: true,
            file: `dist/${bundle}.esm.js`,
            format: 'esm'
        }
    ],
    plugins: [
        sourcemaps(),
        eslint({
            exclude: [
                'src/**.scss',
                'src/**.css',
                'src/**.less',
            ]
        }),
        resolve({
            mainFields: ['module', 'main', 'jsnext:main', 'browser'],
            extensions
        }),
        babel({
            exclude: './node_modules/**',
            extensions,
        }),
        production && terser(),
    ]
};
