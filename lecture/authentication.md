# Authentication

- User authentication, remember users, sessions
- Login, social login
- Create password

## User Model

- `User` schema 및 model 생성
- Root router에서 `/join`을 GET,POST request에 대해 각각 route
  - GET request : Pug로 join page 생성
  - POST request : 입력 폼에서 POST method로 submit
    - `<form method="POST">` 및 `<input>`

## Unique 값의 중복 저장 방지

- Username, email 등이 중복으로 생성되지 못하게 만들어야 함
- Schema에서 `unique` type property를 사용했다면, 중복 데이터가 db에 저장될 때 "duplicate key error" 발생
- Unique 해야 하는 값이 이미 database에 있는지 검색 => `exists({})` 활용
  ```js
  await Model.exists({ value });
  ```
- 두 개 이상의 값이 unique해야 할 때, unique 값들을 한 번에 검색 => `$or` operator 활용
  ```js
  // `$or`에 OR 연산할 query들을 array로 나열
  await Model.exists({ $or: [{ value1 }, { value2 }] });
  ```
- Unique 값 각각에 대해 개별적으로 error 처리를 하고 싶다면 `exist()`를 개별적으로 사용해도 괜찮을 것

## Status Code

- User 생성 form에서 submit 버튼을 통해 username, password를 전송하면 브라우저가 비밀번호를 저장할 것인지 물어봄
- `<input>`의 name이 username, password인 것을 감지하여 자동으로 띄워주는 것
- 이 때, 계정 생성에 실패해도 비밀번호를 저장하겠냐고 물어보는 문제가 있음
- **Status code가 200**이기 때문에 발생. 즉, status code를 통해 요청이 성공적으로 수행되었다고 인식한 것
- Error가 발생했다는 것을 브라우저에게도 알려주려면 다른 status code를 사용해야 함
  - 브라우저는 status code가 200인 응답을 받으면 해당 웹사이트를 방문 기록에 저장
  - Status code가 4xx인 응답을 받으면 history에 남기지 않음
  - 즉, 브라우저는 status code를 사용해서 적절한 동작을 하므로 맞게 보내주어야 한다.
- Status code
  - 2xx : Success
  - 4xx : Client errors
    - 400 : Bad request
    - 404 : Page not found
- Response로 status code를 보내는 방법
  ```js
  res.status(400).render("view");
  ```

## Login과 Session

### 로그인을 위한 검사

- 입력한 username으로 된 `User`가 database에 있는지 검사

```js
const user = await User.findOne({ username });
if (!user) {
  return res.status(400).render("login", {
    pageTitle: "Login",
    errorMessage: "An account with this username does not exists.",
  });
}
```

- 입력한 password의 hash value가 database에 저장된 `User`의 hashed password와 일치하는지 검사

```js
const user = await User.findOne({ username });
const isMatched = await bcrypt.compare(password, user.password);
if (!isMatched) {
  return res.status(400).render("login", {
    pageTitle,
    errorMessage: "Wrong password.",
  });
}
```

### 로그인 후 사용자 인증 처리

- `express-session` : Express에서 session을 처리할 수 있게 해 주는 middleware를 제공하는 package
  - 설치 : `npm i express-session`
- 브라우저가 backend와 상호작용할 때마다(request를 보낼 때 마다) session middleware를 통해 브라우저에 cookie를 전송해 줌
  - Cookie에는 session ID가 들어 있음
  - Session data 자체는 server에 저장, cookie에는 session ID만 저장
- 브라우저는 backend에 request를 보낼 때 cookie를 추가함 (직접 할 필요 없다)
- Router를 연결하기 전에 express app에 session middleware 추가
  ```js
  const sessionHandler = session({
    secret: "Hello",
    resave: true,
    saveUninitialized: true,
  });
  app.use(sessionHandler);
  ```
  - 브라우저에서 웹사이트에 방문할 때 마다 새 session ID를 만들고 브라우저에 전송
  - 브라우저는 cookie에 session ID를 저장하고, `express-session`도 session DB에 session을 저장
  - 이후 브라우저가 **같은 domain으로 모든 URL에 요청을 보낼 때 마다** session id가 저장된 cookie를 서버에 전송
  - 서버는 **어떤 user(브라우저)에서 요청을 보냈는지** 알 수 있음 (전송된 id가 session DB에 저장되어 있는지 확인)
- Session은 하나의 객체로, 임의의 값을 추가할 수도 있다.
  ```js
  // /add-one URL에서 계속 새로고침하면 session의 `potato` 값이 1씩 증가한다.
  app.get("/add-one", (req, res) => {
    req.session.potato += 1; // property 동적 할당
    return res.send(`${req.session.id} \n ${req.session.potato}`);
  });
  ```
- 저장된 모든 session 확인
  ```js
  app.use((req, res, next) => {
    req.sessionStore.all((error, sessions) => {
      console.log(sessions);
      next();
    });
  });
  ```
  - Backend는 생성된 모든 session id를 관리함
  - Session store : session을 저장하는 곳
    - 테스트를 위한 임시 저장소(in memory)
    - 서버가 재시작되면 저장된 모든 session이 삭제된다.
    - MongoDB와 연결해서 session들을 영구적으로 저장해야 함
- Session 영구 저장하기
  - `express-session`이 session을 저장하는 기본 storage는 `MemoryStore`
  - `MemoryStore`는 실제로 사용하기 위한 것이 아니므로, 서버가 종료되면 저장된 session이 삭제됨
  - Session을 database에 저장해서 서버가 종료되어도 session이 유지될 수 있도록 설정
  - `express-session`은 다양한 종류의 database를 연동할 수 있게 지원함
  - MongoDB에 연동하기 위해 `connect-mongo` package 설치
    - `npm i connect-mongo`
  - Session middleware를 만들 때 `store`를 `MongoStore`로 교체
    ```js
    app.use(
      session({
        secret: "Hello",
        resave: true,
        saveUninitialized: true,
        // MongoStore로 교체
        store: MongoStore.create({
          mongoUrl: "mongodb://127.0.0.1:27017/wetube",
        }),
      })
    );
    ```
  - MongoDB에 `sessions` collection이 생성되고, 이후 서버가 생성한 session 정보는 MongoDB에 저장됨

### Login User 기억하기

- User가 login하면 user에 대한 정보를 session에 저장
  ```js
  export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    // authentification codes
    req.session.loggedIn = true;
    req.session.user = user;
    res.redirect("/");
  };
  ```
- 로그인에 성공했을 때 session에 저장한 data가 **같은 domain의 다른 page에 접속할 때 마다 유지**됨
- 이 data로 **특정 page에 방문한 user의 로그인 여부**를 확인할 수 있음
- 다른 브라우저에서 접속한다면 로그인되지 않은 것으로 인식될 것
  - 브라우저(client)마다 다른 session을 갖고, 각 브라우저마다 cookie에 다른 session ID가 저장됨
  - 다른 브라우저에서 보낸 요청에 포함된 session ID에는 `loggedIn` property 값이 다르므로 로그인한 사용자와 구분된다.

### Pug Template에서 Session Object의 값 사용하기

- Pug template 안에서는 request 값에 직접 접근할 수 없음
- `res.render()`가 아니면 parameter를 전달하기도 어려움
- `Response`의 `locals` object를 사용한다.
  - `locals` object는 emplate에서 직접 접근할 수 있음
  - Pug와 Express가 서로 `locals`를 공유할 수 있도록 설정되어 있다.
  - 즉, Pug template의 **전역 변수**를 정의하는 것과 비슷함
  - Middleware에서 locals에 값을 미리 넣어두면
    ```js
    app.use((req, res, next) => {
      res.locals.isLoggedIn = req.sessions.isLoggedIn;
      next();
    });
    ```
  - Pug template에서 `locals` object의 property(`isLoggedIn`)에 직접 접근할 수 있다.
    ```js
    h1 You are #{isLoggedIn ? "already logged In" : "not logged in"}
    ```

## Session 사용 방식 개선하기

- `express-session`으로부터 middleware 생성 시 `saveUninitialized` 속성을 `true`로 설정했다.
- 이 설정은 웹사이트에 방문해서 서버에 요청하는 모든 사용자에 대해 session을 만들고 cookie로 전송해 준다.
- 여기에는 **서버가 기억할 필요가 없는 User**들도 포함되어 있으므로, 모든 사용자의 session을 만들고 저장하는건 비효율적
  - 로그인 하지 않고 둘러보기만 하는 user
  - Bot user 등
- 서버가 특정 사용자들에 대해서만 session을 저장해야 관리해야 한다.
  - 즉, 모든 사용자에 대해 session을 생성하지만 **필요한 사용자의 session만 DB에 저장**한다.
  - 필요하지 않은 사용자의 session은 무시한다.
- 로그인 한 사용자만 기억하려고 하는 경우,
  - Session을 저장할 대상은 "로그인 한 사용자" 이다.
  - 로그인한 사용자의 session에는 `isLoggedIn: true` 또는 사용자 정보(`user`) 등이 추가된다.
    ```js
    const postLogin = (req, res) => {
      ...
      req.session.loggedIn = true;
      req.sessions.user = user;
      ...
    }
    ```
  - 즉, **session object가 변경된 적이 없다면 로그인하지 않은 사용자이므로 session을 DB에 저장할 필요가 없다.**
  - 로그인 한 사용자의 session만 DB에 저장하고 cookie에 session ID를 담아서 브라우저에 전송한다.
- `express-session`은 `saveUninitialized` option으로 이 동작을 제어한다.
  - `saveUninitialized: true` : 모든 session을 연결된 DB에 저장한다.
  - `saveUninitialized: false` : 생성 후 변경된 적이 없는 session은 DB에 저장하지 않는다.
    ```js
    const sessionMiddleware = session({
      ...
      saveUninitialized: false,
      ...
    });
    app.use(sessionMiddleware);
    ```

## Session 취약점 개선

- Session을 사용할 때의 문제점은 '**백엔드가 session을 관리한다**'는 것
- 외부에서 session ID 또는 token 등을 탈취해서 서버에 요청을 보내면, 서버는 정상 사용자라고 인식할 것
- 따라서, 보안을 위한 설정이 필요하다.
  - **Secret**
    - Session cookie에 서명(sign)할 때 사용하는 문자열 값
    - Cookie 서명 : 우리의 backend가 준 쿠키를 사용했다는 것을 보여주기 위해 수행
    - 다른 사람이 session을 탈취하는 **session hijack 공격에 대응**하는 것
      - Secret string으로 cookie를 sign해서 우리가 만든 것임을 증명할 수 있다.
    - 따라서, **secret 값이 외부에 노출되지 않도록 보관**하고, **길이가 긴 무작위 문자열**로 생성해야 함
  - **Database URL**
    - Database URL을 알면 민감한 정보들이 담긴 database에 접근할 수 있으므로 노출되지 않도록 보호해야 함
- 환경 변수(environment variable)

  - 민감한 data가 외부에 공개되지 못하게 막을 때 사용하는 방법
    - Database URL
    - Secret Key
    - API Key
  - `process.env`로 application 환경 변수에 접근할 수 있다.
  - GitHub에 업로드되지 않아야 하는 등 비공개로 유지해야 하는 데이터는 **환경 변수 파일(`.env`)**에 넣는다.
    ```text
    COOKIE_SECRET=asdfasdasd;lfkahsdgl;i129031k23li
    DB_URL=mongodb://127.0.0.1:27017/wetube
    ```
    - `.env`는 `package.json`이 위치한 곳에 생성해야 한다. (root level에서 접근해야 하므로)
    - `.gitignore`에 `.env`를 추가해서 민감한 데이터가 GitHub에 공개되지 않도록 막는다.
  - `dotenv` package를 사용하면 `.env` 파일을 찾아서 `key=value` 값들을 읽은 후 `process.env`에 추가해 준다.
    - `npm i dotenv`
  - App이 실행된 후 가장 먼저 환경 변수가 설정되도록 만드는게 좋다.
    - `require()` 사용 : 환경 변수를 사용하려는 **모든 파일**에서 개별적으로 선언해야 하므로 비효율적이다.
      ```js
      require("dotenv").config();
      ...
      ```
    - `import` 사용 : entry point 등에서 한번 import하면 app 전역에서 환경 변수에 접근할 수 있다.
      ```js
      // init.js
      import "dotenv/condfig" /* 가장 먼저 읽는 init.js 파일의 최상단에 import 한다. */
      ...
      ```
  - 이후 `process.env`로 저장한 환경 변수에 접근한다.

    ```js
    // database 설정
    import mongoose from "mongoose";
    mongoose.connect(
      process.env.DB_URL
    ); /* 환경 변수에서 database URL 가져오기 */

    // session middleware 설정
    const sessionMiddleware = session({
      secret: process.env.COOKIE_SECRET /* 환경 변수에서 secret key 가져오기 */,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        // 이미 mongoose가 MongoDB와 연결되어 있으므로
        // mongoose의 client를 사용해서 만들 수도 있다.
        // client: connection.client
        mongoUrl: process.env.DB_URL /* 환경 변수에서 database URL 가져오기 */,
      }),
    });
    app.use(sessionMiddleware);
    ```
