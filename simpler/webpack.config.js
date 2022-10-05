// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");

const isProduction = process.env.NODE_ENV == "production";

// adapted from https://stackoverflow.com/questions/63573199/is-there-any-way-in-webpack-html-loader-preprocessor-for-html-file-interpolation
const processNestedHtml = (content, loaderContext, dir = null) => {
  const INCLUDE_PATTERN = /<include src="(.+)"\s*\/?>(?:<\/include>)?/gi
  if(!INCLUDE_PATTERN.test(content)) return content
  else {
    return content.replace(INCLUDE_PATTERN, (m, src) => {
      const filePath = path.resolve(dir || loaderContext.context, src)
      loaderContext.dependency(filePath)

      return processNestedHtml(loaderContext.fs.readFileSync(filePath, 'utf8'), loaderContext, path.dirname(filePath))
    })
  }
}


const config = {
  entry: {
    main: "./src/index.js",
    plain: "./src/plain.scss",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: '[name].[contenthash].bundle.js',
  },
  devServer: {
    open: true,
    host: "localhost",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
      chunks: ['main'],
    }),
    new HtmlWebpackPlugin({
      template: "public/privacy.html",
      filename: "privacy.html",
      chunks: ['plain'],
    }),
    new HtmlWebpackPlugin({
      template: "public/terms.html",
      filename: "terms.html",
      chunks: ['plain'],
    }),

    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: "babel-loader",
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      // {
      //   test: /\.md$/i,
      //   use: [
      //     {loader: "html-loader"}, 
      //     {
      //       loader: "remark-loader", 
      //       options: {
      //         remarkOptions: {
      //           plugins: [RemarkHTML],
      //         },
      //       },
      //     }],
      // },
      {
        test: /\.html$/i,
        loader: "html-loader",
        options: {
          preprocessor: processNestedHtml
        },
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";

    config.plugins.push(new WorkboxWebpackPlugin.GenerateSW());
  } else {
    config.mode = "development";
  }
  return config;
};
