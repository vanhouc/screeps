module.exports = {
    entry: './src/main.ts',
    output: {
        filename: 'screeps.js',
        library: 'screeps',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: ['', '.js', '.ts', '.d.ts', '.tsx']
    },
    devtool: 'source-map', // if we want a source map
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: 'ts-loader' }
        ]
    }
}