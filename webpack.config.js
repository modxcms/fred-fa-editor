const path = require('path');

module.exports = (env, options) => {
    const isProd = options.mode === 'production';

    return {
        mode: options.mode,
        devtool: isProd ? false : 'source-map',

        entry: [
            './_build/assets/js/index.ts'
        ],

        output: {
            path: path.resolve(__dirname, './assets/components/fredfaeditor/web'),
            library: 'FredFAEditor',
            libraryTarget: 'umd',
            libraryExport: 'default',
            filename: 'fredfaeditor.min.js'
        },

        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.js$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: 'babel-loader'
                    }
                },
            ]
        },

        resolve: {
            alias: {
            },
            extensions: [ '.ts', '.js' ],
            fallback: {
                "path": require.resolve("path-browserify"),
                "url":  require.resolve("url/"),
                fs: false
            }
        },

        plugins: []
    };
};
