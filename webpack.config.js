const path = require('path');

module.exports = {
  // enntry file
  target:'web',
  entry: './src/web4b.js',  
  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: 'web4b.js',
    library: 'web4b',
    libraryTarget: 'umd'    
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'src/js')
        ],
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  devtool: 'source-map',
  // https://webpack.js.org/concepts/mode/#mode-development
  mode: 'development'
//   mode: 'production'
};