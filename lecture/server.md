# Server

- 항상 켜져있고 인터넷에 연결되어 있는 컴퓨터
- Request를 listening하고 response함 -> request/response로 서버와 상호작용
  - request : 인터넷을 통해 데이터를 요청하는 것
  - listening : request가 일어나는 것을 감시하고 있는 것
  - response : request를 보낸 대상에게 데이터를 전달하는 것

## Express로 server를 실행하는 과정

1. Import `express`
   ```javascript
   /*  [ Import Module ]
    - "express"라는 package를 `express`라는 이름으로 가져옴(import)
    - nodeJS와 npm은 `node_modules`에서 해당 package를 찾아서 해당 package의 `index.js`를 가져옴
    - `import express from "node_modules/express"` 처럼 쓰지 않아도 된다.
   */
   import express from "express";
   ```
2. Create a express application
   ```javascript
   import express from "express";
   const app = express();
   ```
3. Set up application
   ```javascript
   /*   [ Server Settings ]
        - 서버를 실행하기 전에 동작을 미리 정의해 둠
            - Client로부터 요청(request)을 받았을 때 응답 방식 정의 (e.g. 특정 route로 GET request를 받았을 때 동작)
            - 기타 business logic 구현
        - 서버가 실행되면 request를 listening하고 있다가, 특정 request가 들어오면 여기서 정의해 둔 코드들이 실행됨
    */
   // Root page로 GET request가 왔을 때 응답을 보냄
   app.get("/", (req, res) => {
     return res.end();
   });
   ```
4. Start the express server to listen some requests (open to public)
   ```javascript
   /*   [ Starts a Server ]
        - Express server를 실행시켜서 request listening 시작
            - port : listening할 port 지정
            - callback : 서버가 시작될 때 호출되는 함수
        - localhost를 통해 접속할 수 있음 (`localhost:{port}`)
            - 화면에 응답이 표시됨 (e.g. Cannot GET /)
   */
   const PORT = 4000;
   app.listen(PORT, () => {
     console.log(`Server listening on port ${PORT}`);
   });
   ```

### Port

- 어떤 경우에는 서버가 외부에 공개되어 있지 않아서 특정 request만 listening 할 수도 있음
- 서버는 컴퓨터 전체를 listen 할 수 없음. 컴퓨터에서 **open되어 있는 port**를 통해 통신할 수 있다.
- Port는 컴퓨터 내부로 들어올 수 있는 문/창문 같은 존재
- `4000`번은 거의 비어있어서 백엔드 개발할 때 자주 사용됨
- 더 높은 번호일 수록 다른 프로그램에서 사용되고 있을 확률이 적다.

## Express server 개발

- 사용자가 어떤 웹페이지에 방문하면 브라우저가 서버에 GET request를 보냄
  - 웹사이트에 접속할 떄 브라우저는 웹사이트를 "가져와서(GET)" 보여주는 것
  - 웹사이트가 있는 곳으로 "가는" 것이 아님
- Request를 listening 하기만 하는 상태에서는 request가 왔다는 것을 알 수 있지만, **어떤 동작을 할 지**는 정하지 않음
- 이 때, `Cannot GET /` 같은 message가 출력될 수 있음
  - `/` : root path (page)
  - `GET` : HTTP method
  - `GET /` : The GET request to the root page
  - `Cannot GET /` : Root page에 대해 GET request를 보냈지만 응답을 받을 수 없다
- 따라서, 특정 request가 발생했을 때 어떤 동작을 할 지 명시해 주어야 함

### Respond to request

- Request를 전달할 때 URL 사용
  - `http://localhost:4000` : baseURL
  - `/` : home page (root) (e.g. `http://localhost:4000/`)
  - `/login` : login page (e.g. `http://localhost:4000/login`)
  - 브라우저의 주소창에 특정 URL을 입력해서 접속을 시도하는 것은 브라우저가 해당 URL에 대한 page 정보를 가져오기(GET) 위해 server에 request를 보내는 것
  - 브라우저는 server에서 해당 page 정보를 보내줄 때 까지 대기한다.
- Server는 **client(or browser)가 특정 URL로 request를 보냈을 때 어떻게 해야 하는지** 구현함 (어떤 응답(response)를 보내줘야 하는지)
- GET HTTP method
  - 브라우저가 특정 URL에 request를 보낼 때 사용하는 기본 동작, HTTP method
  - 우리는 웹사이트에 "가는 것"이 아니라, 그 page의 데이터를 서버에 요청하고 "가져와서" 보여주는 것
- Express app에서 `get(route,callback)` method 구현 => **GET method로 온 request 처리**
  - GET request가 도차했을 때 실행할 동작 설정
  - `route`
    - Client가 server에 request를 보낼 수 있는 URL
    - 특정 page로 가려면 "어디로(어떤 URL로) 가야 하는지" 알려주는 것
    - `/` : root(home) page url
    - `/login` : (로그인 페이지를 이 url로 개발했다면) login page url
  - `callback`
    - request가 도착했을 때 실행할 code
    - Express는 callback argument로 두 가지 object를 전달함
      - request : server가 받은 request 정보를 담은 object (client 정보, cookies, browser 정보, IP 주소 등)
      - response : server에서 전달하려는 response object. (request에 어떻게 응답할지 결정)
    - Callback 안에서 request 정보를 활용해 어떤 작업을 하고, 완료 후 response object를 통해 client에 응답을 보냄
      - `response` object를 통해 브라우저에 응답을 보내야 요청이 종료됨
      - Server가 client에게 response를 보내주지 않으면, 브라우저에서는 response를 받을 때 까지 무한 대기(until timeout)
      - 요청을 종료하고 응답을 반환하는 방법
        - `response.end()` : response 없이 연결을 종료시킴
        - `response.send()` : response로 message(or HTML)를 전달하고 연결을 종료시킴
- 작성 예시

  ```javascript
  // Root page로 GET request가 왔을 때 처리
  app.get("/", (req, res) => {
    console.log(`Someone is going to ${req.url}`);
    return res.end();
  });

  // Login page로 GET request가 왔을 때 처리
  app.get("/login", (req, res) => {
    return res.send("Login here.");
  });
  ```

  - `return`은 생략할 수 있음. `Response`의 어떤 method를 호출하는지가 중요
  - Response를 두 번 이상 보낼 수 없음. 실수 방지를 위해 `return` 키워드를 사용해서 뒤에 실수로 작성되는 코드의 실행을 막을 수 있다.

### Middleware

- 브라우저가 request를 보내고 server가 response를 돌려주는 사이에서 동작하는 software
- callback handler가 곧 middleware
- handler == MVC의 controller. 즉, 모든 controller는 middleware가 될 수 있다.
- Response를 보내고 연결을 종료시키는 것을 제외한 handler 또는 controller는 middleware이다.
- `next` : controller(handler)의 세 번째 argument\

  - `next()`를 호출하면 현재 실행되는 controller의 다음(next)번에 추가된 controller를 실행시킴 => **middleware로서 동작**
  - 가장 마지막에 있는 controller는 request를 종료하기 위해 `res.end()`, `res.send()` 등을 호출할 것이므로 middleware가 아님
  - middleware로 동작하는 controller에서만 `next` argument를 사용한다.
  - 작성 예시

    ```javascript
    const gossipMiddleware = (req, res, next) => {
      // 사람들이 웹사이트의 어디를 가려고 하는지 알고싶음
      // req.url : request의 url 정보를 가져옴
      console.log(`Someone is going to ${req.url}`);
      next();
    };
    // handleHome도 `next` argument를 사용할 수 있지만, 응답을 해 주는 마지막 controller에선 생략하는게 관습
    const handleHome = (req, res) => {
      return res.send("I love middleware");
    };

    /*  응답을 반환하는 `handleHome`이 마지막으로 실행됨
        그 전에 middleware가 실행된다.
     */
    app.get("/", gossipMiddleware, handleHome);
    ```

### Global Middleware

- middleware를 전역에서 사용할 수 있게 해줌 (create global middleware which works with any url)
- Global middleware로 등록된 controller는 callback으로 등록하지 않아도 항상 실행된다.
- 여러 route에 대해 재사용되는 middleware를 global middleware로 추가하는 것
- `app.use()`로 global middleware를 선언한 뒤 `get()`을 호출해야 함 (**순서 중요**)
  ```javascript
  const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  };
  app.use(logger);
  app.get("/", handleHome);
  app.get("/login", handleLogin);
  ```
- 사용 예시 : 외부에 공개하지 않을 page에 대한 GET request 차단
  ```javascript
  const privateMiddleware = (req, res, next) => {
    // `/protected` url에 대해서 process를 중단시키고 다른 응답을 반환하는 middleware
    // `next()`가 호출되지 않으므로 다음 handler(handleProtected)가 실행되지 않음
    // 즉, 특정 page로 route하는 것을 막는다.
    if (req.url === "/protected") {
      return res.send("<h1>Not Allowed</h1>");
    }
    console.log("Allowed, you may continue.");
    next();
  };
  app.use(logger);
  app.use(privateMiddleware);
  app.get("/", handleHome);
  app.get("/protected", handleProtected);
  ```
  - 사용자의 로그인 여부 확인 등에도 사용

### External Middlewares : Morgan

- `morgan` : request logger middleware for node.js
- 더 상세하고 정교한 log 제공
  ```
  GET /protected 404 1.665 ms - 148
  GET / 200 0.457 ms - -
  ```
- option: `dev`, `combined`, `short`, `tiny`, ...
- ref : https://www.npmjs.com/package/morgan?activeTab=readme
