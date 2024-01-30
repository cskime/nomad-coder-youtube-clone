const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = {
  /* [ Client를 위한 file 경로 설정 ]
   * `client` : 브라우저만을 위한 source code들을 저장
   * `assets` : Webpack이 변환한 source code. 실제 배포 후에는 `assets` file을 사용할 것
   */
  entry: {
    main: "./src/client/js/main.js",
    videoPlayer: "./src/client/js/videoPlayer.js",
    recorder: "./src/client/js/recorder.js",
  },
  plugins: [new MiniCssExtractPlugin({ filename: "css/styles.css" })],
  mode: "development",
  watch: true,
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
};
