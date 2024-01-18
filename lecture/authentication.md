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

## Login

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
- 모두 통과했다면 로그인 성공 -> Home 화면으로 보내는 등 redirect
- 로그인에 성공했다면, 이후로 웹사이트에 접속할 때 로그인에 성공했다는 것을 알고 있어야 함
