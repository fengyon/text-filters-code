const webpack = require("webpack"); //引入webpack

module.exports = {
  entry: __dirname + "/index.js", //主入口，必写项
  output: {
    publicPath: "./out/",
    path: __dirname + "/out", //输出路径
    filename: "bundle.js", //输出名字
  },
  module: {
    rules: [
      {
        test: /(\.tsx|\.ts)$/,
        use: [
          {
            loader: "babel-loader",
          },
          {
            loader: "",
          },
        ],

        exclude: /node_modules/,
      },

      {
        test: /\.css$/,

        use: [
          {
            loader: "style-loader",
          },

          {
            loader: "css-loader",
          },
        ],
      },

      {
        test: /.(jpg|png)$/,

        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },

  //引入jquery。
};
