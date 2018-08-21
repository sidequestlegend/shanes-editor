const CopyWebpackPlugin = require('copy-webpack-plugin');
const WorkerLoader = require('worker-loader');
module.exports = {
    entry: {
        app:"./src/app.js",
        renderer:"./src/renderer.js"
    },
    mode:"development",
    output: {
        path: __dirname + "/dist",
        filename: "[name]-bundle.js",
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.worker\.js$/,
                use: { loader: 'worker-loader' }
            }
        ]
    },
    devServer: {
        stats: "errors-only",
        contentBase: __dirname+"/dist",
        open:true
    }
};