import commonjs from '@rollup/plugin-commonjs';
import html from '@rollup/plugin-html';
import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/game.ts',

  //  Where the build file is to be generated.
  //  Most games being built for distribution can use iife as the module type.
  //  You can also use 'umd' if you need to ingest your game into another system.
  //  The 'intro' property can be removed if using Phaser 3.21 or above. Keep it for earlier versions.
  output: {
    file: 'dist/index.js',
    name: 'Game',
    format: 'iife',
    sourcemap: true,
    intro: 'var global = window;'
  },

  plugins: [
    //  We need to convert the Phaser 3 CJS modules into a format Rollup can use:
    commonjs({
      include: [
        'node_modules/eventemitter3/**',
        'node_modules/phaser/**'
      ],
      exclude: [
        'node_modules/phaser/src/polyfills/requestAnimationFrame.js'
      ],
      sourceMap: true,
      ignoreGlobal: true
    }),
    html({ title: 'TicTacToe' }),
    //  Resolve modules in node_modules
    nodeResolve(),
    //  Toggle the booleans here to enable / disable Phaser 3 features:
    replace({
      'typeof CANVAS_RENDERER': JSON.stringify(true),
      'typeof WEBGL_RENDERER': JSON.stringify(true),
      'typeof EXPERIMENTAL': JSON.stringify(true),
      'typeof PLUGIN_CAMERA3D': JSON.stringify(false),
      'typeof PLUGIN_FBINSTANT': JSON.stringify(false),
      'typeof FEATURE_SOUND': JSON.stringify(true)
    }),
    // Parse our TS files
    typescript(),
    // Run it in browser using NodeJS process runner
    serve({
        open: false,
        contentBase: 'dist',
        host: 'localhost',
        port: 10001,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    })
  ]
};
