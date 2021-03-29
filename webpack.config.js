const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, options) => {  
    var options = options || {};
    const isProd = options.mode === 'production';
    // get library details from JSON config
    var libraryDesc = require('./package.json').library;
    var libraryName = libraryDesc.name;

    // determine output file name
    var outputName = buildLibraryOutputName(libraryDesc, isProd);

    return {
        mode: options.mode,
        devtool: isProd ? false : 'source-map',

        entry: [
            '@babel/polyfill',
            './_build/assets/js/index.js'
        ],

        output: {
            path: path.resolve(__dirname, './assets/components/fredfaeditor/web'),
            library: libraryName,
            libraryTarget: 'umd',
            libraryExport: 'default',
            filename: outputName
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
                }
            ]
        },

        resolve: {
            extensions: [ '.ts', '.js' ],
        },

        plugins: [
            isProd ? new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: ['fredfaeditor.*']
            }) : () => {}
        ]
    };
};
function buildLibraryOutputName(libraryDesc, isProd) {
    return libraryDesc["dist-web"] || [libraryDesc.name, 'web', (isProd ? 'min.js' : 'js')].join('.');
}