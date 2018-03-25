import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
    input: 'src/server/modules.js',
    output: {
        file: 'src/server/modules.js',
        format: 'cjs',
        exports: 'named'
    },
    plugins: [
        nodeResolve({
            jsnext: true,
            main: true
        }),

        commonjs({
            sourceMap: false
        })
    ]
};