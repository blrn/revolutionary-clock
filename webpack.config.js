const path = require("path");

module.exports = {
  entry: "./src/sketch.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist/",
  },
  mode: "development",
  devServer: {
    allowedHosts: "all",
    static: {
      // Tell dev-server where to find static files
      directory: path.join(__dirname, "."), 
    },
    devMiddleware: {
      publicPath: "/dist/",
    },
  },
};
