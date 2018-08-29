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
                use: { loader: 'worker-loader',options: { inline: true } }
            }
        ]
    },
    devServer: {
        stats: "errors-only",
        contentBase: __dirname+"/dist",
        open:true,
        disableHostCheck: true,
        public: 'http://192.168.0.8:8080',
        host:'192.168.0.8'
    }
};