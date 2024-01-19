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

## Secured Password

- Database에 password를 그대로 저장하면 해킹 당했을 때 password가 유출될 수 있음
- Password를 database에 저장하기 전에 알아볼 수 없도록 보안 처리를 해야 함 (hashing)
- Bcrypt 사용
  - Password-hashing function.
  - Bcrypt는 Rainbow table 공격(hashing된 password를 사용한 해킹 공격)을 막아준다.
  - `node.bcrypt.js` : Bcrypt를 Javascript에서 사용할 수 있게 만든 package
- 로그인 할 때에도 password를 직접 비교하지 않고 **입력한 hash 값과 저장된 hash 값을 비교**한다.
  - Hash 함수는 결정적 함수(deterministic function)
  - 같은 입력(input)에 대해 항상 같은 hash value를 반환하므로, hash 값으로 비교할 수 있다.
- Password 다루는 시나리오
  - 계정 생성 : password 입력 후 submit -> hashing -> hashed password를 db에 저장
  - 로그인 : password 입력 후 login -> hashing -> input hashed password와 db에 저장된 password 비교
- `node.bcrypt.js` 사용법
  ```js
  /* [ Hash ]
    - `password` : original password
    - `saltRounds` : Hashing 횟수. 해싱을 여러 번 해서 해독을 더 어렵게 만든다.
  */
  await bcrypt.hash(password, saltRounds);
  /* [ Compare with Hash ] 
    - `password` : original password
    - `hash` : 비교할 hash value
  */
  await bcrypt.compare(password, hash);
  ```
- Password를 저장할 때 hashing을 전처리하는 middleware 활용
  ```js
  import bcrypt from "bcrypt";
  const userSchema = new mongoose.Schema({});
  userSchema.pre("save", async function () {
    // this는 database에 저장하려고 하는 현재 객체
    // User의 `password` property를 덮어쓴다.
    this.password = await bcrypt.hash(this.password, 5);
  });
  ```

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

- 로그인을 위한 검사
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
- 로그인 후 사용자 인증 처리
  - `express-session` : Express에서 session을 처리할 수 있게 해 주는 middleware를 제공하는 package
    - 설치 : `npm i express-session`
  - 브라우저가 backend와 상호작용할 때마다(request를 보낼 때 마다) session middleware를 통해 브라우저에 cookie를 전송해 줌
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
  - 각 session들은 개별적으로 key-value 쌍 데이터를 저장할 수 있음

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

### Session / Cookie / Token(JWT)

- HTTP 요청은 stateless communication
  - 모든 요청들이 독립적으로, 서로의 상태(state)를 알 수 없음
  - 요청을 보내면 곧바로 종료되며 연결이 유지되지 않음
- 즉, 요청이 끝나면 서버는 요청을 보낸 client에 대한 정보를 잃어버림
- 따라서, client는 서버에 요청을 보낼 때 마다 누가 보낸 것인지 알려줘야 함 (자신의 정보를 알려줘야 함)
- **Cookie는 client의 정보를 주고받는 수단**이고, **session은 서버가 client를 식별하는 방법** 중 하나이다.
- **Cookie** : 브라우저와 서버가 데이터를 주고받을 때 사용하는 것
  - Cookie는 서버에서 만들어서 client에 전송하고, client는 cookie를 저장해 두었다가 요청할 때 마다 사용함
  - 브라우저는 서버에 요청을 보낼 때 해당 domain에 대한 cookie를 같이 보냄
  - 서버는 브라우저에 응답을 보낼 때 cookie에 데이터를 담아서 보냄
- **Session** : 로그인, 사용자 인증한 기록
  - Session ID : 로그인한 사용자를 식별하기 위한 ID
  - Session DB : 로그인한 사용자의 정보를 저장하는 DB
  - Session은 서버에서 생성해서 cookie에 담아 client에 전송되고, client는 자동으로 cookie를 저장한다.
    - 즉, 어떤 domain으로 최초 요청을 보냈을 때는 session이 없다.
  - Process
    1. 사용자 로그인
    2. 서버에서 session ID 발급
    3. Session DB에 session ID와 사용저 정보 저장
    4. 브라우저로 응답을 보낼 때 Session ID가 담긴 cookie 함께 전송
    5. 브라우저는 서버가 보낸 cookie를 자동으로 안전한 장소에 저장
    6. 로그인 이후 브라우저가 서버에 요청을 보낼 때 마다 session ID가 담긴 cookie를 함께 보냄
    7. 서버는 브라우저가 보낸 cookie에서 session ID를 가져와서 session DB 조회
    8. Session DB에서 ID가 일치하는 사용자 정보를 찾으면 인증처리
- **Token** : Cookie를 사용할 수 없는 환경에서 사용자 인증을 위해 사용하는 값
  - iOS/Android native app에서 많이 사용됨
  - Process
    1. 사용자 로그인
    2. 서버가 token을 만들어서 app에 전송
    3. App은 token을 안전한 곳에 저장 (e.g. iOS의 UserDefaults)
    4. 서버에 요청을 보낼 때 마다 token을 함께 보냄
    5. 서버는 session db에서 app이 보낸 token과 ID가 일치하는 사용자 정보를 찾으면 인증 처리
- **JWT(JSON Web Token)** : 서버에서 session 없이 인증을 처리하기 위해 사용하는 token
  - Session은 사용자 정보를 모두 DB에 저장해서 사용하므로, 사용자가 늘어날수록 DB resource가 많이 필요함
  - JWT는 서버에 사용자 정보를 저장하지 않고, token의 유효성 검사만 수행하여 인증 진행
  - Process
    1. 사용자 로그인
    2. 서버에서 사용자 데이터를 서명(signing)된 token으로 변환하여 응답과 함께 전송
    3. 브라우저는 JWT를 안전한 장소에 저장해둠
    4. 로그인 이후 브라우저가 서버에 요청을 보낼 때 마다 JWT를 함께 보냄
    5. 서버는 JWT의 유효성 검사 수행 (e.g. 변조되지 않았는지, 만료되었는지 등)
    6. 유효성 검사에 성공하면 인증처리
- Session과 JWT 방식의 장단점
  - Session 방식
    - 장점
      - 사용자 정보를 모두 DB에 저장하고 있으므로 추가 기능을 구현할 수 있음
      - 원격 로그아웃, 로그인 device 개수 제한 등
    - 단점
      - 사용자가 늘어남에 따라 더 많은 DB resource가 필요해짐 (비용 증가)
      - DB query에 의한 속도 최적화 필요
  - JWT 방식
    - 장점
      - 서버에 사용자 정보를 저장하지 않고 간단하게 인증 처리 가능
      - DB를 추가로 사용하지 않아도 됨
    - 단점
      - JWT는 암호화되지 않았기 때문에 민감한 정보를 담지 말아야 함 (e.g. password)
      - 사용자가 많아지고 관리해야 할게 많아진다면 session 방식이 필요할 수 있음

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
