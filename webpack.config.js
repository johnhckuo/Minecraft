var path = require('path');
var Webpack = require("webpack");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

var extractPlugin = new ExtractTextPlugin({
   filename: 'bundle.css'
});

module.exports = {
  entry: [__dirname+'/src/script/main.js'],
  output: {
    path: __dirname +'/docs',
    filename: 'bundle.js'
  },
  plugins: [
    new Webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        'root.jQuery': 'jquery'
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    extractPlugin,
    new CleanWebpackPlugin(['dist']),
    new Webpack.ProvidePlugin({
        'THREE': 'three'
    })
  ],
  module: {
    loaders: [
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          use: [
            'file-loader',
            {
              loader: 'image-webpack-loader',
              options: {
                bypassOnDebug: true,
              },
            },
          ],
        }
    ],
    rules: [
        {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader'
            ]
        },
        {
      			test: /\.scss$/,
      			use: extractPlugin.extract({
      			    use: [
      			        'css-loader',
      			        'sass-loader'
      			    ]
      			})
      	},
        {test: /\.jpg$/, use: 'url-loader?mimetype=image/jpg'},
        {test: /\.png$/, use: 'url-loader?mimetype=image/png'},
    ],
  },
  resolve: {
    alias: {
      'three/OrbitControls': __dirname + '/node_modules/three/examples/js/controls/OrbitControls.js'
      // 'three/OBJLoader': path.join(__dirname, 'node_modules/three/examples/js/loaders/OBJLoader.js')
    }
  }
};
