# Webpack

- `.sass` 등 다양한 종류의 파일들을 `.js`, `.css` 등 **브라우저가 이해할 수 있는** 코드로 변환해 주는 module bundler
- 파일을 압축하거나(`.js`, `.jpg` 등) 변환(`.scss` -> `.css`)해 줌
- Backend에서는 `babel-node`를 사용해서 버전에 상관 없이 동작하는 Javascript를 작성할 수 있었음
- Frontend에서는 webpack으로 같은 목적을 달성함. 즉, **브라우저 호환 코드로 변환**해 주는 것
- React 등 대부분의 프레임워크에는 webpack이 내장되어 있으므로 실제로 webpack을 다룰 일은 없을 수도 있음

## Webpack 개발 흐름

1. Backend code 개발
2. Frontend(client)에서 사용할 code 작성 (Javascript, CSS, SCSS 등)
3. Webpack으로 client code 압축 및 변환 (static files)
4. Backend에서 만든 HTML view에서 static file을 import (CSS link, Javascript script 등)
5. Client에서 server가 rendering한 page를 요청하면 static code에 접근 (CSS 적용, Javascript file 실행 등)

## 설치

- `npm i webpack-cli -D` : `devDependencies`로 `webpack-cli` 추가
- Webpack을 쉽게 실행할 수 있도록 script 추가 (`npm run assets`)
  ```json
  {
    ...
    "scripts" : {
      "dev:server": "...",
      "dev:assets": "webpack --config webpack.config.js", // config file 실행
      // or
      "dev:assets": "webpack" // Default config file 실행 ("webpack.config.js" 이름을 찾음)
    }
  }
  ```

## Webpack Configuration

- `webpack.config.js` 파일에서 configuration object를 export
- `webpack.config.js` 파일에서는 오래된 javascript 코드만 이해할 수 있음
  - `import` -> `require()`
  - `export` -> `module.exports`

### 변환할 File 및 변환된 File 경로 설정

```js
const path = require("path");
module.exports = {
  entry: "./src/client/js/main.js,
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "assets", "js"),
    clean: true,
  },
}
```

- `entry` : 변환할 source file 경로 지정
  - Entry point로 `main.js` 사용
  - CSS file까지 한 번에 변환하기 위해 `main.js` 내부에서 css도 함께 import
    ```js
    import "../scss/styles.scss";
    // some code
    ```
  - 여기서 import된 CSS는 rule에서 `css-loader`를 설정해서 CSS 코드로 변환
- `output` : 변환된 source file을 저장할 경로 설정
  - `filename` : 변환된 source file의 이름
  - `path` : 변환된 source file의 경로 (**absolute path**)
    - `__dirname` : 현재 file의 directory absolute path
    - `path.resolve(paths...)` : Argument로 전달된 path들을 하나로 이어붙여 준다.
  - `clean` : Webpack을 실행할 때 output 경로에 있던 이전 file들 삭제
- `entry`, `output`은 required

### 변환 방식 설정

```js
const path = require("path");
module.exports = {
  entry: ...,
  output: {...},
  module {
    rules: [
      /* Loader 1개 사용 */
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      /* 여러 개 Loader 사용 */
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  }
}
```

- `rules` : 파일 종류에 따라 어떻게 변환시킬 것인지 설정
- `test` : rule을 적용할 file 지정. Regular expression 사용 가능
- `use` : 사용할 loader 설정 (Loader : 변환기 (webpack word))
  - Loader 1개 사용
    - `loader` : 사용할 loader 지정
    - `options`
      - Loader가 사용할 option
      - `babel-loader`는 babel core(`@babel/preset-env`를 사용)
  - 여러 개 loader 동시 사용
    - Array로 loader 목록 전달
    - **사용하는 순서의 역순**으로 array에 전달해야 함 (webpack은 뒤에서부터 읽기 때문)
  - Loader
    - `babel-loader` : Javascript code의 호환성 유지를 위해 호환되는 옛날 javascript code로 변환
    - `sass-loader` : SCSS를 CSS로 변환
    - `css-loader`
      - `@import`, `url()` 등 문법을 `import/require`로 해석 후 변환
      - 분산된 CSS를 하나의 CSS file로 합쳐준다.
    - `style-loader` : CSS를 DOM에 주입 (`<head>` 안의 `<style>`에 CSS code를 넣어줌)

### Mode 설정

```js
const path = require("path");
module.exports = {
  entry: ...,
  mode: "development"
  output: {...},
  module: {...},
}
```

- Webpack에 개발중인지 알려줌 (`development` or `production`)
- 개발중에는 코드를 압축하지 않게 하기 위함
  - `development` mode : 변환된 code에 comment 등 개발 중 필요한 정보들이 추가됨
  - `production` mode : File을 실제로 압축. Backend를 서버에 올릴 때 `production`으로 변경

### Watch 설정

- 파일이 변경되는 것을 감지(watch)해서 webpack을 실행시켜 줌
  ```js
  module.exports = {
    ...
    watch: true,
    ...
  }
  ```
- 이 설정을 활성화하면 webpack을 실행했을 때 process가 종료되지 않음
- 코드가 수정될 때 마다 webpack을 실행해서 다시 compile함

## Mini CSS Extract Plugin

- `style-loader`를 사용하면 `<style>`에 CSS를 넣는 Javascript code가 생성됨
- 이 방식은 Javascript가 load되기 전에는 CSS가 적용되지 않는다는 단점이 있음
- CSS 파일들을 Javascript와 분리해서 만들고 싶을 때 `MiniCSSExtractPlugin` package 사용
  ```js
  const MiniCssExtractPlugin = require("mini-css-extract-plugin");
  const path = require("path");
  module.exports = {
    entry: ...,
    plugins: [new MiniCssExtractPlugin({ filename: "css/styles.css" })]
    mode: ...,
    output: {
      filename: "js/main.js",
      path: path.resolve(__dirname, "assets"),
    },
    module {
      rules: [...,
        {
          test: /\.scss$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
          // use: ["style-loader", "css-loader", "sass-loader"],
        },
      ],
    }
  }
  ```
  - Package 설치 : `npm i mini-css-extract-plugin -D`
  - `plugins` : Webpack에서 사용할 plugin 등록
    - `MiniCssExtractPlugin`에 `filename` option 추가
    - 생성되는 CSS 파일 이름 설정
    - Javascript file과 분리하기 위해 `css/~`로 설정
  - `output` 수정
    - Javascript file 분리를 위해 `filename`을 `js/main.js`로 수정
    - `path`를 `assets` root로 변경
  - `style-loader`를 `MiniCssExtractPlugin.loader`로 교체
    - Webpack이 생성한 CSS를 browser에 적용하는 방식을 변경하는 것

## Client에 적용

- Client는 **Webpack에 의해 생성된 CSS, Javascript만 접근**한다.
- 변환된 javascript file을 browser(client)에서 접근할 수 있도록 static file을 외부에 공개
  ```js
  /* Video 및 avatar image와 같은 방법으로 적용
   * Client에서 `/static/~` URL로 요청할 때 `assets` 폴더에 있는 파일에 접근 허용
   */
  app.use("/static", express.static("assets"));
  ```
- HTML view에서 공개된 static file 연결
  ```html
  <html>
    <head>
      <!-- MiniCssExportPlugin을 사용해서 추출한 CSS File -->
      <link rel="stylesheet" href="/static/css/styles.css" />
    </head>
    <body>
      ...
      <!-- Babel에 의해 변환된 Javascript File -->
      <script src="/static/js/main.js"></script>
    </body>
  </html>
  ```
