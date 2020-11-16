import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from "rollup-plugin-terser";
import { eslint } from 'rollup-plugin-eslint';

// const path = require('path');

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const production = !process.env.ROLLUP_WATCH;

module.exports = {
    // mode: 'development',
    input: 'src/index.ts',
    output: [
        {
            sourceMap: true,
            file: 'dist/index.common.js',
            format: 'cjs'
        },
        {
            name: 'VisualNE',
            sourceMap: true,
            file: 'dist/index.umd.js',
            format: 'umd'
        },
        {
            sourceMap: true,
            file: 'dist/index.esm.js',
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
