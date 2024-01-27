# User Login

- `/login` GET request를 통해 login page 요청 -> rendering
- `/login` POST request를 통해 login 요청 -> Update data, create session
- GET request는 browser가 website에 접근할 때 page rendering을 위해 server에 보내는 default method
- POST request는 `<form>`에서 method를 `POST`로 지정해야 함
  ```html
  <form method="POST">
    <input type="submit" value="login" />
  </form>
  ```

## Login 과정

### User 검색

```js
const user = await User.findOne({ username });
if (!user) {
  return res.status(400).render("login", {
    pageTitle: "Login",
    errorMessage: "An account with this username does not exists.",
  });
}

const isMatched = await bcrypt.compare(password, user.password);
if (!isMatched) {
  return res.status(400).render("login", {
    pageTitle,
    errorMessage: "Wrong password.",
  });
}
```

- 입력한 username으로 된 `User`가 database에 있는지 검사
- 입력한 password의 hash value가 database에 저장된 `User`의 hashed password와 일치하는지 검사

### 로그인 성공 시 사용자 인증 처리

- `express-session` : express에서 session을 처리할 수 있게 해 주는 middleware를 제공하는 package
- `express-session`의 session middleware 등록
  ```js
  const sessionHandler = session({
    secret: "Hello",
    resave: true,
    saveUninitialized: true,
  });
  app.use(sessionHandler);
  ```
  - 브라우저에서 보낸 요청에 session ID가 들어있지 않으면 새 session 생성 후 **session DB**에 저장
  - Server는 response를 반환할 때 session ID를 cookie에 담아서 전송
  - 이후 브라우저가 server에 요청을 보낼 때 마다 session ID가 담긴 cookie를 함께 전송 (브라우저가 해 주는 기능)
  - Server는 session ID로 session DB에서 session 검색
  - 검색한 session 정보를 바탕으로 어떤 client에서 보낸 요청인지, 로그인 된(인증된) 사용자인지 확인

### Session에 사용자 정보 저장

- `express-session`이 만드는 session은 객체이므로 임의의 값을 추가할 수도 있다.
- Session으로부터 사용자 정보를 쉽게 가져올 수 있도록 session에 `user` property 저장
  ```js
  const postLogin = async (req, res) => {
    ...
    /* Login 성공 여부를 판단하기 위해 `isLoggedIn` property 추가
     * Login된 사용자의 정보를 쉽게 가져오기 위해 `user` property 추가
     */
    req.sesion.isLoggedIn = true;
    req.session.user = user;
    res.redirect("/");
  }
  ```

### Login User 기억하기

- 로그인 후에는 모든 url 요청에 대해 `session`에 저장한 `user`에 접근할 수 있음
- 이 data로 **특정 page에 방문한 user의 로그인 여부**를 확인할 수 있다.
  - 로그인 한 사용자가 요청했을 때는 `req.session`에 `isLoggedIn` 및 `user` 데이터가 존재할 것
  - 로그인하지 않은 사용자가 요청할 때는 `req.session`에 이 data들이 존재하지 않는다.
  - 즉, `req.session`에 추가한 **login 관련 property를 참조**해서 요청을 보낸 사용자가 로그인 되었는지(인증 되었는지) 확인할 수 있다.
    ```js
    export const protectorMiddleware = (req, res, next) => {
      // 로그인된 사용자의 session 정보에는 `isLoggedIn` property가 저장되어 있으므로
      // process를 이어서 진행할 수 있다.
      if (req.session.isLoggedIn) {
        return next();
      }
      // 로그인이 필요한 서비스에 로그인하지 않고 접근했으므로 로그인 페이지로 Redirect
      res.redirect("/login");
    };
    ```
    - 이 middleware를 login이 필요한 request로 routing하는 중간에 추가한다.
      ```js
      userRouter
        .route("/edit")
        .all(protectorMiddleware)
        .get(getEdit)
        .post(postEdit);
      ```
    - 로그인하지 않은 사용자의 접근을 막을 수 있다.
- 브라우저를 바꿔서 접속한다면 session ID가 저장된 cookie가 없으므로 로그인이 풀릴 것이다.
  - 브라우저(client)마다 다른 session을 갖고, 각 브라우저마다 cookie에 다른 session ID가 저장됨
  - 다른 브라우저에서 보낸 요청에 포함된 session ID에는 `loggedIn` property 값이 다르므로 로그인한 사용자와 구분된다.

### Pug Template에서 Session값 사용하기

- 로그인 후 session으로부터 사용자 정보를 가져와서 Pug에 전달해서 화면에 보여준다.
- 이 때, `render()`를 사용하면 data를 argument로 전달할 수 있다.
- 하지만, `redirect()`를 사용하는 경우에는 data를 직접 전달할 수 없다.
- `res.locals`를 사용해서 모든 Pug view에서 사용자 data에 접근한다.
  - `res.locals` : express에 등록된 모든 View template에서 사용할 수 있는 지역 객체
  - Pug와 Express가 서로 `locals`를 공유할 수 있도록 설정되어 있다.
  - 즉, Pug template의 **전역 변수**를 정의하는 것과 비슷함
  - Middleware에서 locals에 값을 미리 넣어두면
    ```js
    const localsMiddleware = (req, res, next) => {
      res.locals.isLoggedIn = req.sessions.isLoggedIn;
      res.locals.user = req.session.user || {};
      next();
    };
    ```
  - Pug template에서 `locals` object의 property에 직접 접근할 수 있다.
    ```pug
    h1 You are #{isLoggedIn ? "already logged In" : "not logged in"}
    ```

## Session 영구 저장

- `express-session`은 별도로 설정하지 않으면 생성한 session을 memory에 저장함
- 저장된 session 확인
  ```js
  app.use((req, res, next) => {
    req.sessionStore.all((error, sessions) => {
      console.log(sessions);
      next();
    });
  });
  ```
  - `sessionStore` : session을 저장하는 곳
  - Default로 테스트를 위한 임시 저장소(in memory)를 사용하므로, 서버가 재시작되면 저장된 모든 session이 삭제된다.
  - Server 생명주기와 독립적으로 session data를 관리할 수 있도록 외부 database(MongoDB)와 연결하여 영구 저장한다.
- `express-session`과 MongoDB 연동
  - `express-session`은 다양한 종류의 database와 연동을 지원함
  - `connect-mongo` : `express-session`과 MongoDB를 연동하기 위한 package
  - Session middleware 생성 시 `store` property로 저장소를 `MongoStore`로 교체
    ```js
    app.use(
      session({
        ...
        store: MongoStore.create({
          mongoUrl: "mongodb://127.0.0.1:27017/wetube",
        }),
      })
    );
    ```
  - 이 시점에는 이미 mongoose가 MongoDB와 연결되어 있으므로 mongoose의 client를 사용해서 만들 수도 있다.
  ```js
    app.use(
      session({
        ...
        store: MongoStore.create({client: connection.client}),
      })
    );
  ```
- 연동 후, MongoDB에 `sessions` collection이 생성되고 서버가 생성한 session 정보는 이 collection에 저장된다.

## Session 사용 방식 개선

- `express-session`으로부터 `session` middleware 생성 시 `saveUninitialized` 속성을 `true`로 설정하면 웹사이트에 방문해서 서버에 요청하는 **모든 사용자에 대해 session을 만들고 cookie로 전송**해 준다.
  ```js
  app.use(
    session({
      ...
      saveUninitialized: true,
      ...
    })
  );
  ```
- 하지만, server에 요청을 보내는 사용자들 중에는 **서버가 기억할 필요가 없는 사용자**도 포함되어 있다.
  - 로그인 하지 않고 둘러보기만 하는 user
  - Bot user 등
- 모든 사용자의 session을 만들고 저장하는건 비효율적이므로, **특정 사용자들에 대해서만 session을 저장**하도록 개선한다.
  - Session은 모든 사용자에 대해 생성한다.
  - **Session이 필요한 사용자**에 대해서만 sessions DB에 저장한다.
  - Session이 필요하지 않은 사용자의 session 정보는 DB에 저장하지 않고 무시한다.
- 로그인 한 사용자만 기억하려고 하는 경우 예시
  - Session을 저장할 대상은 "로그인 한 사용자" 이다.
  - 사용자가 로그인에 성공하면 `session` 객체에 `isLoggedIn`와 `user` property를 추가한다.
  - 즉, 로그인된 사용자라면 `session` 객체에 수정이 발생하므로, **`session` 객체가 수정된 적이 없는 사용자는 session을 DB에 저장할 필요가 없다.**
- 따라서, `session` middleware 생성 시 `saveUninitialized`을 `false`로 설정해야 한다.
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

- Session을 사용할 때의 문제점은 '**backend에서 session을 관리한다**'는 것
- 외부에서 session ID 또는 token 등을 탈취해서 서버에 요청을 보내면, 서버는 정상 사용자라고 인식할 것
- `session` middleware를 생성할 때 `secret` 보안 설정이 필요하다.
  - `secret` : Session cookie에 서명(sign)할 때 사용하는 문자열 값
  - Cookie 서명 : *우리의 backend가 준 쿠키를 사용했다*는 것을 보여주기 위함
  - 다른 사람이 session을 탈취하는 **session hijack 공격에 대응**하는 것
  - 즉, secret string으로 cookie를 sign해서 cookie의 위변조 여부를 검사할 수 있다.
  - `secret` 문자열은 쉽게 알아낼 수 없도록 **길이가 긴 무작위 문자열**로 생성해야 함

## 회원가입 및 사용자 정보 변경

### Unique 값의 중복 저장 방지

- 사용자를 고유하게 식별할 수 있는 username, email 등은 중복으로 생성할 수 없어야 함
- Database level에서 방지
  - Schema에서 고유값에 `unique` type property 설정
  - db에 저장하려는 document의 data가 db에 이미 존재할 때 "duplicate key error"를 발생시킨다.
- Source code level에서 방지
  - Unique 해야 하는 값이 이미 database에 있는지 검색 -> `exists(filter)` 활용
  ```js
  await Model.exists({ value });
  ```
  - 두 개 이상의 값이 unique해야 할 때, unique 값들을 한 번에 검색 -> `$or` operator 활용
    ```js
    // `$or`에 OR 연산할 query들을 array로 나열
    await Model.exists({ $or: [{ value1 }, { value2 }] });
    ```

## Error Handling

### Status Code

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

## Logout

- 로그인은 session이 유효할 때 가능한 것
- 로그아웃으로 인식하는 경우
  - 브라우저에서 cookie를 삭제하면 서버에서 session ID를 찾지 못함
  - 서버에서 session DB의 데이터를 삭제하면 브라우저에서 보낸 session ID를 찾지 못함
- `express-session`이 제공하는 `destroy()`를 사용하면 `express-session`이 생성한 session이 database에서 삭제되고 `req.session` object도 unset 되어 로그아웃 처리된다.
  ```js
  export const logout = (req, res) => {
    req.session.destroy();
    res.redirect("/"); // Logout 후 home 화면으로 redirect
  };
  ```
