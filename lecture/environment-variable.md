# 환경 변수(environment variable)

- Application 전역에서 사용할 값을 외부에 노출되지 않게 정의한 것
- 민감한 data가 외부에 공개되지 못하게 막을 때 사용한다.
  - Database URL
  - Secret Key
  - API Key
- Cookie 서명에 사용하는 `secret` 값이나 database URL은 외부에 노출되지 않게 관리해야 하므로 환경 변수에 저장해 두고 사용한다.

## .env

- `.env` : 환경 변수를 관리하는 파일
  ```text
  COOKIE_SECRET=asdfasdasd;lfkahsdgl;i129031k23li
  DB_URL=mongodb://127.0.0.1:27017/wetube
  ```
- `.env`는 **`package.json`이 위치한 경로**에 생성해야 한다. (root level에서 접근해야 하므로)
- 환경 변수는 외부에 공개되면 안되기 때문에 `.env` 파일을 `.gitignore`에 추가해서 GitHub에 업로드되지 않도록 막는다.

## 환경 변수 사용

- `dotenv` : 직접 생성한 `.env` 파일에 정의된 `key=value` 값들을 읽어와서 `process.env`에 추가해 주는 package
- 환경 변수에 저장된 값을 사용하는 곳에서 `process.env.{VARIABLE}`로 접근할 수 있다.
- App이 실행된 후 가장 먼저 환경 변수가 설정되어야 이후 전역에서 사용할 수 있다.
  ```js
  // init.js
  // entry module의 가장 첫 번째 줄에서 환경 변수를 설정한다.
  import "dotenv/config";
  ```
  - `import`를 사용하면 최초 한 번만 import하면 app 전역에서 환경 변수에 접근할 수 있다.
  - `require()`를 사용하면 환경 변수를 사용하려는 **모든 파일**에서 개별적으로 설정해야 하므로 비효율적이다.
    ```js
    require("dotenv").config();
    ```
- `process.env`로 등록한 환경 변수 사용
  - Database 연결
    ```js
    import mongoose from "mongoose";
    /* 환경 변수에서 database URL을 가져와서 연결 */
    mongoose.connect(process.env.DB_URL);
    ```
  - Session middleware 생성 시 cookie sign을 위한 `secret` 지정
    ```js
    const sessionMiddleware = session({
      secret: process.env.COOKIE_SECRET /* 환경 변수에서 secret key 가져오기 */,
      ...,
      store: MongoStore.create({
        mongoUrl: process.env.DB_URL /* 환경 변수에서 database URL 가져오기 */,
      }),
    });
    app.use(sessionMiddleware);
    ```
