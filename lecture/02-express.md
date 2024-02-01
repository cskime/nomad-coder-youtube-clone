# Express

## Server

- 항상 켜져있고 인터넷에 연결되어 있는 컴퓨터
- Request를 listening하고 response를 반환해 줌 -> **Client는 request/response로 서버와 상호작용**
  - request : 인터넷을 통해 데이터를 요청하는 것
  - response : request를 보낸 대상에게 데이터를 전달하는 것
  - listening : request가 일어나는 것을 감시하고 있는 것
- Server를 실행하면 *localhost*를 통해 접속할 수 있음 (`localhost:{PORT}/path`)
- Client와 server의 상호작용
  - 사용자가 어떤 웹페이지에 방문하면 브라우저(client)가 server에 GET request를 보냄
    - 브라우저의 주소창에 특정 URL을 입력해서 website에 접속을 시도함
    - 이것은 브라우저가 **해당 URL에 대한 page 정보를 가져오기(GET) 위해 server에 request를 보내는 것**
    - 즉, 웹사이트에 접속할 때 브라우저는 웹사이트를 **"가져와서(GET)" 보여주는 것** -> GET HTTP method
    - 웹사이트가 있는 곳으로 "가는" 것이 아님
  - Client가 server에 request를 보낼 때 **URL** 사용
    - baseURL : `http://localhost:{PORT}`
    - `/` : home page (root) (e.g. `http://localhost:{PORT}/`)
    - `/login` : login page (e.g. `http://localhost:{PORT}/login`) -> path: `/login`
  - Server가 listening 하는 상태라면 request가 도착한 것을 알아채고 처리할 수 있음
    - Listening만 하고 있으면 webpage에 접속할 때 `Cannot GET /` 같은 message가 출력됨
    - `/` : root path (page)
    - `GET` : HTTP method
    - `GET /` : The GET request to the root page
    - `Cannot GET /` : Root page에 대해 GET request를 보냈지만 응답을 받을 수 없다
  - Server에서 **특정 request가 도착했을 때 method에 따라 어떤 동작을 할지** 명시적으로 구현해야 함
  - 브라우저는 server에서 request를 받아 필요한 작업을 처리하고 응답(response)을 보낼 때 까지 대기한다.
  - Server에서 명시적으로 response를 보내고 HTTP 연결을 종료하면 브라우저에 server에서 보낸 content를 표시할 수 있다.

## Express Server

- Node.js 기반 `express` framework를 사용해서 server backend를 개발할 수 있다.

### 설치

```shell
npm i express
```

### 초기화

```javascript
import express from "express";

/* Create App */
const app = express();

/* App Settings */
...

/* Start listening
 * Binds and listens for connections on the specified host and port.
 */
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
```

- PORT : 컴퓨터 내부로 들어올 수 있는 통로, 창구
  - 서버는 컴퓨터 전체를 listen 할 수 없고, **open되어 있는 port**를 통해서만 통신할 수 있다.
  - `4000`번은 거의 비어있어서 백엔드 개발할 때 자주 사용됨
  - 더 높은 번호일 수록 다른 프로그램에서 사용되고 있을 확률이 적다.

### App Settings

- Store any value and use it
  ```js
  app.set("title", "My Site");
  app.get("title"); // "My Site"
  ```
- Configure the behavior of the server
  ```js
  app.set("view engine", "pug");
  app.set("views", process.cwd() + "/src/views");
  ```
  - `view engine` : The default engine extension
  - `views` : A directory for the application's views
  - [More properties](https://expressjs.com/en/4x/api.html#app.settings.table)

### Respond to request

- `get(path, middleware)` : GET request handling
  ```js
  // URL : http://localhost:{PORT}/
  app.get("/", (req, res) => {
    res.end();
  });
  ```
- `post(path, middleware)` : POST request handling
  ```js
  // URL : http://localhost:{PORT}/login
  app.post("/login", (req, res) => {
    res.send("Login Succeed");
  });
  ```
- `route(path)` : 동일한 URL에 대해 두 method로 받은 request를 동시에 처리
  ```js
  import express from "express";
  const router = express.Router();
  router.route("/some/path").get(getController).post(postController);
  ```
  - `get(middleware)`, `post(middleware)`로 route의 GET/POST request에 대한 middleware 별도 설정
  -

### Request members

- `req.params` : It's an object containing properties mapped to the **named route parameters**
  ```js
  // Request URL: http://localhost:4000/users/34/books/8989
  app.get("/users/:userId/books/:bookId", (req, res) => {
    req.send(req.params); // { "userId": "34", "bookId": "8989" }
  });
  ```
- `req.query` : It's an object containing a property for each **query string parameter** in the route
  ```js
  // Request URL: http://localhost:4000/users?userId=34&bookId=8989
  app.get("/users/:userId/books/:bookId", (req, res) => {
    req.send(req.query); // { "userId": "34", "bookId": "8989" }
  });
  ```
- `req.body` : It contains key-value pairs of data submitted in the **request body**
  ```js
  app.use(express.json()); // for parsing application/json
  app.post("/profile", (req, res, next) => {
    res.json(req.body); // { "name": "Chamsol Kim", "email": "kcsol1005@gmail.com" }
  });
  ```
  - It's populated when you use body parsing middleware.
    - `express.json()` : for parsing `application/json`
    - `express.urlencoded()` : for parsing `application/x-ww-form-urlencoded`

### Response members

- `res.end()` : Ends the response process.
  ```js
  res.end();
  ```
- `res.send(body)` : Sends the HTTP response
  ```js
  res.send(Buffer.from("whoop")); // Send a Buffer object
  res.send({ some: "json" }); // Send an object
  res.send("<p>some html</p>"); // Send a String
  res.send([1, 2, 3]); // Send an array
  ```
- `res.render(view, locals?, callback?)` : Renders a view and sends the rendered HTML string to the client.
  ```js
  res.render("index");
  res.render(
    "index",
    { name: "Kim" }, // The `index` view can uses `name` vairable inside
    (error, html) => res.send(html)
  );
  await res.render("index", { name: "Kim" }); // Use a Promise instead of callback function
  ```
- `res.redirect(status?, path)` : Redirects to the URL derived from the specified path, status.
  ```js
  res.redirect("post/new"); // Redirects to relative path
  res.redirect("/admin"); // Redirects to absolute path
  res.redirect("https://example.com"); // Redirects to a fully-qualified URL
  res.redirect(301, "https://example.com"); // Redirects with status code
  ```
- `res.status(code)` : Sets the HTTP status for the response
  ```js
  res.status(400).end(); // chainable
  ```
- `res.sendStatus(code)` : Status code를 설정한 뒤 client로 response를 보냄
  ```js
  res.sendStatus(404);
  ```
  - `res.status(code)`는 response에 status code를 추가하기만 하고, 실제로 응답을 보내진 않는다.

## Middlewares

- HTTP 요청 process 중간에서 실행되는 software
- Request cycle이 끝나기 전에 실행된다.
  - Browser에서 server로 요청을 보냄
  - Server는 backend에서 request에 대한 처리 수행
  - 일련의 처리 과정이 끝난 뒤 browser로 response 반환
- Middleware == handler == controller
  - Middleware : 독립적으로 실행되는 하나의 software로 보는 관점
  - Controller : 아키텍처 관점에서 View와 Model 사이를 연결하는 코드 작성. 일반적으로 response를 반환하는 것이 controller
  - Handler : Callback으로 실행되는 함수를 가리키는 가장 범용적인 단어. Route에 대한 요청이 들어올 때 실행되어 handler로 부를 수도 있음
  - Express에서는 공식적인 용어인 *middleware*를 사용하고, 아키텍처에 따라 response를 반환하는 함수를 *controller*로 부른다.
- Request(`req`) 및 response(`req`) 객체와 `next()` 함수를 parameter로 받아서 필요한 코드를 실행한다.
  - Request(`req`)
    - Server가 받은 request 정보를 담은 object
    - client 정보, cookie, browser 정보, IP 주소 등 저장
  - Response(`res`)
    - Server에서 전달하는 response object (request에 대한 응답 결정)
    - Response를 보내야 client에서 요청을 보낸 cycle이 종료된다.
    - Response를 보내지 않으면 브라우저가 무한 로딩에 빠진다.
  - `req` 또는 `res` 객체를 변경하거나 controller가 실행되기 이전 전처리 또는 준비 단계 실행
- Request, response 및 `next()` middleware function에 접근할 수 있음
- 서로 다른 controller들 사이에 **중복되는 코드**가 있다면 middleware로 추출하는 것을 고려해 볼 수 있다.

### 사용 방법

```js
const middleware1 = (req, res, next) => {
  console.log("Middleware 1");
  next(); // `next()`를 호출해야 `middleware2`가 실행된다.
};
const middleware2 = (req, res, next) => {
  console.log("Middleware 2");
  next(); // `next()`를 호출해야 `controller`가 실행된다.
};
const controller = (req, res) => {
  res.send("Hello"); // `controller`는 마지막 middleware이므로 `next()`를 호출할 필요가 없다.
};
app.get("/", middleware1, middleware2, controller);
```

- 특정 url로 들어오는 요청에 대해 routing할 때 middleware를 callback으로 추가한다.
  - `get(path, ...)` : `path` url로 들어오는 GET request
  - `post(path, ...)` : `path` url로 들어오는 POST request
- Middleware로 사용할 함수는 parameter로 `next` 함수를 추가로 받는다.
- Middleware가 `next()`를 호출하면 다음 middleware가 호출된다.
- 즉, middleware에서 `next()`를 호출하지 않으면 요청 process가 진행되지 않는다.
- Middleware로 사용할 함수에서는 **반드시 `next()`를 호출**해야 한다.

### Global Middleware

```js
// 모든 url에 대해 request log를 기록하고 보여주는 middleware
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

/* '/protected' url에 대한 요청이 들어올 때 인증 없이 접근할 수 없게 막는 middleware
 * 이 검사는 모든 url에 대해 수행해야 하므로 global middleware로 등록
 */
const privateMiddleware = (req, res, next) => {
  if (req.url === "/protected") {
    return res.send("<h1>Not Allowed</h1>");
  }
  console.log("Allowed");
  next();
};

app.use(privateMiddleware); // Routing 전에 등록해야 한다.

app.get("/", rootController);
app.get("/protected", handleProtected);
```

- Middleware를 **모든 url에 대해 동작**하는 global middleware로 사용할 수 있다.
- 여러 url에 대해 공통으로 실행할 코드를 재사용할 수 있다.
- `use()` method를 통해 global middleware를 등록한다.
- **등록하는 순서**에 주의한다.
  - `use()`가 `get()`, `post()`, `route()`보다 먼저 실행되어야 한다.
  - `use()`로 먼저 등록해 두어야 실제 routing할 때 실행될 수 있다.

### 이미 개발되어 있는 Middleware 사용

- Built-in middlewares
  - `urlencoded(options)` : Header의 `content-type`이 `application/x-www-form-urlencoded`인 request의 body를 parsing해 주는 middleware
    ```js
    app.use(express.urlencoded({ extended: true }));
    ```
    - `options`
      - `extended` : URL encoded body를 Javascript object 형식으로 사용할 수 있도록 변환해 줌
        - `{ extended: true }` : 변환 library를 `querystring`으로 사용
        - `{ extended: false }` : 변환 library를 `qa`로 사용
      - `parameterLimit` : Parameter 개수 제한
  - `json(options)` : Header의 `content-type`이 `application/json`인 request의 body를 parsing해 주는 middleware
    ```js
    app.use(express.json());
    ```
    - Body로 JSON string을 보낼 때 header에 `"Content-Type": "application/json"`을 담아서 보냄
    - Express server는 `"Content-Type"`이 `"application/json"`인 request를 받으면 내부적으로 **`JSON.parse(string)`**를 사용해서 parsing하고, Javascript object로 변환해서 `req.body`에 매핑해 줌
  - `text()` : Express server가 request body로 전달되는 text를 parsing하도록 하는 middleware
    ```js
    app.use(express.text());
    ```
- External middlewares
  - `morgan`
    ```
    GET /protected 404 1.665 ms - 148
    GET / 200 0.457 ms - -
    ```
    - Request logger middleware for node.js
    - 더 상세하고 정교한 log 제공한다.
    - option: `dev`, `combined`, `short`, `tiny`, ...
    - ref : https://www.npmjs.com/package/morgan?activeTab=readme
  - `express-session` : `express`에서 session을 처리할 수 있게 하는 middleware를 제공하는 package
    ```js
    const sessionHandler = session({
      secret: "Hello",
      resave: true,
      saveUninitialized: true,
    });
    app.use(sessionHandler);
    ```

## Router

- An isolated instance of middleware and routes
- It's a "mini-application", capable only of performing middleware and routing functions.
- Express app의 **middleware와 route를 관리하는 독립된 mini-application**

### URL Structure

- URL은 사용자의 행동 및 사용하려는 데이터를 나타낸다.
  - `/` : home
  - `/join` : Join
  - `/login` : Login
  - `/edit-user` : Edit user profile
  - `/edit-video` : Edit video
  - `/watch-user` : Watch user profile
  - `/watch-video` : Watch the video
- 기능이 세분화되고 많아질수록 이런 방식은 관리하기 좋지 않고 가독성도 떨어진다.
- Domain별로 group을 만들어서 URL을 **구조화**하면 유지보수가 용이하다.
  - Root
    - `/` : home
    - `/join` : join
    - `/login` : login
  - User
    - `/users/{ID}/edit` : edit user profile who has `ID`
    - `/users/{ID}` : watch user profile who has `ID`
  - Video
    - `/videos/{ID}/edit` : edit video which has `ID`
    - `/videos/{ID}` : watch video which ahs `ID`
- URL 구조는 마케팅 측면에서 예외를 적용할 수 있다.
  - 로그인 관련 URL은 `/users`로 groupping 되어야 한다.
  - 하지만, 마케팅을 위해 URL을 더 간결하고 쉽게 만들어야 한다면 `/users/login`보다 `/login`이 더 좋은 구조가 될 수 있다.
  - 행위가 명확하게 구분된다면 간결한 형태를 유지해도 좋다.
    - `/join`, `/login`은 user에 대한 행위임이 명확하므로 `/users`로 group을 만들지 않고 간결한 URL을 만들어도 좋다.
    - `edit`, `delete` 등은 다양한 상황에 적용될 수 있으므로 `/users`나 `/videos` group으로 묶는게 좋다.
      - `/users/edit`와 `/videos/edit` 구분
      - `/users/delete`와 `/videos/delete` 구분
- URL 구조화는 **사용자 입장**에서 고민하여 설계한다.
  - Home
    - `/` : Home
    - `/join` : 회원가입
    - `/login` : 로그인
    - `/search` : Video 검색
  - User
    - `/users/:id` : See user profile
    - `/users/logout` : Log out
    - `/users/edit` : Edit my profile
    - `/users/delete` : Delete my user
  - Video
    - `/videos/:id` : See video
    - `/videos/:id/edit` : Edit video
    - `/videos/:id/delete` : Delete video (only can creator)
    - `/videos/upload` : Upload video

### Router를 사용한 구조적 처리

- Router를 사용하면 요청으로 들어오는 url들을 **구조적으로 처리**할 수 있다.
  - `/`로 시작하는 url들은 *root router*를 통해 처리
  - `/users`로 시작하는 url들은 *user router*를 통해 처리
  - `/videos`로 시작하는 url들은 *video router*를 통해 처리
- Router를 사용할 때 request 처리 과정
  1. Express app이 GET request 감지
  2. Request URL로부터 매칭되는 router로 request 전달
  3. URL과 매칭되는 sub router가 있다면, 그 router로 request 전달
  4. 해당 router 안에서 request URL에 매칭되는 controller 실행 후 response 반환

### 사용 방법

```js
import express from "express";

const userRouter = express.Router();
const editController = (req, res) => res.send("Edit User Profile");
userRouter.get("/edit", middleware, editController);

const app = express();
app.use("/users", userRouter);
```

- Router 구성
  - `express.Router()` : Router 생성
  - `router.get("/edit", middleware, controller)` : 특정 route에 대해 middleware 및 controller mounting
- Express app에 router 등록
  - `app.use("/users", router)` : 특정 route에 대해 router mounting
- 동작 과정
  1. Express app이 `/users/edit` URL로 request가 들어온 것을 감지
  2. `/users`로 시작하므로 request를 `userRouter`로 전달
  3. User router에서 GET request로 `~/edit` URL이 들어온 것을 감지
  4. Middleware 및 controller 실행 후 response 반환
- 이 때, user router 안에서 `/users`를 반복해서 작성하지 않아도 됨
- User router는 항상 `/users`로 시작하는 URL을 받을 것이므로, user router 내부에서는 `/users` 이후 route에 대해서만 처리

### Router를 사용한 프로젝트 구조 설계

- 하나의 파일에서 모든 url에 대한 요청을 처리하면 유지보수가 어려워진다.
- 역할에 따라 모듈을 분리해서 구조를 만든다.
  - Controller : Client로 response를 반환하는 작업 담당
    ```js
    export const editUser = (req, res) => res.send("Edit User");
    export const deleteUser = (req, res) => res.send("Delete User");
    ```
  - Router
    ```js
    import express from "express";
    import { editUser, deleteUser } from "userController.js";
    const router = express.Router();
    router.get("/edit", editUser);
    router.get("/delete", deleteUser);
    export default router;
    ```
    - Backend entry에서 전달된 request를 받아서 전처리 후 controller로 넘겨주는 역할
    - URL에서 group으로 묶을 수 있는 path element에 대해 router 생성 및 controller 연결
  - Server : server 실행 후 특정 url path에 대해 request를 처리할 router 연결
    ```js
    import express from "express";
    import userRouter from "./routers/router.js";
    const app = express();
    app.use("/users", userRouter);
    ```

## URL Parameters

- URL에서 동적으로 변경될 수 있는 부분을 parameter로 선언
- Server에서는 `req.params`로 query parameter에 매칭된 값에 접근할 수 있음
- `/videos/123` url로 요청이 들어오는 경우
  ```js
  const controller = (req, res) => {
    console.log(req.params); // { id : 123 }
    return res.end();
  };
  app.get("/videos/:id", controller); // `id`에 `123` 매핑
  ```
- Parameter 부분에는 타입에 무관하게 모든 값이 매칭될 수 있으므로, routing 순서에 따라 모든 url에 매칭될 수도 있음
  ```javascript
  // ❌
  // `/upload` URL이 `:id` parameter에 매칭되어
  // `uploadController` 대신 `watchController`가 호출되는 문제가 생김
  router.get("/:id", watchController);
  router.get("/upload", uploadController);
  ```
- 이 문제를 해결하기 위해 두 가지 방법을 사용할 수 있음
  1. Parameter를 가진 url에 대한 routing을 가장 마지막에 정의
     ```javascript
     /* Routing을 선언한 순서대로 매칭한다.
      * - `/upload` URL은 `/upload` route로 정상적으로 매칭되어 upload 동작 수행
      * - 기타 다른 URL은 `/upload` route로 매칭되지 않고 `/:id`로 매칭되어 `see` 동작 수행
      */
     router.get("/upload", upload);
     router.get("/:id", see);
     ```
  2. Parameter에 **제약** 추가
     - 순서를 조절하는 방법은 실수할 여지가 있고, 숫자/문자열 등 다른 타입의 값에 대해서는 대응할 수 없음
     - 이를 위해 express는 route URL에 **정규식 패턴**을 사용할 수 있음
     - URL parameter 뒤에 소괄호(`()`)로 regex 입력
       - 숫자로 된 id만 받고 싶다면, `/:id(\\d+)` URL로 routing
         ```javascript
         router.get("/:id(\\d+))", watch);
         router.get("/upload", upload);
         ```
       - MongoDB를 사용하는 경우, db가 부여하는 id는 24byte hex string이므로 이에 맞는 regex 입력
         ```js
         // 0~9 숫자, a-f 문자(hex 범위), 24자 제한
         router.get("/:id([0-9a-f]{24})", watch);
         ```
       - 이후 `:id` 부분에 숫자만으로 구성된 값이 들어오면 매칭되지 않음
