# Router

- URL이 어떻게 시작하는지에 따라 분류하는 방법
- Controller와 URL 관리를 도와줌. mini-application을 만드는 것
- 프로젝트를 만들 때 생각해야 하는 것 : 어떤 종류의 데이터를 사용할 것인가? **Domain**
  - e.g. wetube -> video, user
- URL은 행동(behavior)를 나타냄
  - `/` : home
  - `/join` : Join
  - `/login` : Login
  - `/search` : Search
  - `/edit-user` : Edit user
  - `/delete-user` : Delete user
  - `/watch-video` : Watch video
  - `/edit-video` : Edit video
  - `/delete-video` : Delete video
  - `/comment-video` : Comment on a video
  - `/delete-comment-video` : Delete a comment of a video
- 기능이 세분화 될 수록 이런 방식의 이름은 가독성도 떨어지고 사용하기 좋지 않음
- 아래와 같이 URL을 domain 별로 groupping하여 **구조적으로** 정리할 수 있음
  - User 관련 URL
    - `/join` -> `/users/join`
    - `/login` -> `/users/login`
    - `/edit-user` -> `/users/edit`
    - `/delete-user` -> `/users/delete`
  - Video 관련 URL
    - `/search` -> `/videos/search`
    - `/watch-video` -> `/videos/watch`
    - `/edit-video` -> `/videos/edit`
    - `/delete-video` -> `/videos/delete`
    - `/comment-video` -> `/videos/comments`
    - `/delete-comment-video` -> `/videos/comments/delete`
- Router는 이렇게 구조화된 URL에 대한 request를 **구조적으로 처리할 수 있는 방법**을 제공함
  - User router : `/users`로 시작하는 URL 묶음
  - Video router : `/videos`로 시작하는 URL 묶음
  - Comment router(Video router의 sub router) : `/comments`로 시작하는 URL 묶음
    - Router는 sub router를 가질 수 있음
- Router를 사용할 때 request 처리 과정
  1. Express app에서 GET request 감지
  2. Request URL로부터 매칭되는 router로 request 전달
  3. URL과 매칭되는 sub router가 있다면, 그 router로 request 전달
  4. 해당 router 안에서 request URL에 매칭되는 controller 실행 후 response 반환
- Exceptions
  - `/join`, `/login`은 user와 관련된 URL이므로, 규칙대로라면 `/users` router에 들어감
  - 하지만, marketing 측면에서 URL을 더 간결하고 쉽게 만들어야 한다면 규칙에 예외를 적용할 수 있다.
    - `/join`, `/login`은 user에 대한 behavior임이 명확하므로 간결한 형태를 유지
    - `edit`, `delete` 같은 URL들은 user 및 video router에 모두 존재할 수 있으므로 router로 구분되는게 더 좋을 것

## Router 사용 방법

### Router 생성

```javascript
import express from "express";
const router = express.Router();
```

- Express가 제공하는 `Router` 생성

### Router 추가

```javascript
import express from "express";
const app = express();
const userRouter = express.Router();
app.use("/users", userRouter);
```

- Express application에 router 추가
- Router도 middleware로 사용할 수 있음
- 특정 path로 시작하는 URL로 request가 들어오면 지정한 router로 전달
  - `/` : Global router
  - `/users` : User router
  - `/videos` : Video router

### Router 사용

```javascript
import express from "express";

const userRouter = express.Router();
const handleEditUser = (req, res) => res.send("Edit User");
userRouter.get("/edit", handleEditUser);

const app = express();
app.use("/users", userRouter);
```

- `/users`로 시작하는 URL로 request가 들어오면 user router로 전달
- User router는 `/edit`이라는 path로 들어오는 request에 대해 응답을 보냄
- 즉, user router는 `/users/~` path로 들어오는 request를 처리하는 코드를 **구조적으로** 작성 가능
- `/users/edit`을 일일이 쓰지 않아도 됨. `/users` router에 `/edit` url을 추가하는 방식

## 역할에 따라 파일 분리하기

### Import and Export

- 모든 파일은 독립된 module이므로, module A가 module B의 코드를 사용하려면
  - Module B가 export한 코드를
  - Module A에서 import한 뒤 사용해야 함
- Export
  - `export default` : File(module) 전체에서 export하는 variable 또는 function
    ```javascript
    import express from "express";
    const router = express.Router();
    //...
    export default router;
    ```
  - Variable 또는 function을 개별적으로 export할 경우, 각 variable 또는 function에 `export` 키워드를 각각 사용
    ```javascript
    import express from "express";
    export const feature1 = (req, res) => res.end();
    export const feature2 = (req, res) => res.end();
    ```
  - 두 방식은 import하는 방법에서 차이를 보인다.
- Import

  - 현재 module로부터 import하려는 module의 상대 경로로 참조
    ```javascript
    /* - 파일 구조:
         server.js
         /routers
           - globalRouter.js
       - `server.js`에서 `globalRouter.js` module을 import
     */
    import globalRouter from "./routers/globalRouter";
    ```
  - default export를 import할 때는 **아무 이름이나 사용해도 됨**. nodeJS가 내부적으로 default export되는 식별자 이름으로 변환해 줌
    ```javascript
    import globalRouter from "./routers/globalRouter";
    // or
    import global from "./routers/globalRouter";
    ```
  - individual export를 import할 때는 중괄호(`{}`) 안에서 export되는 식별자 이름을 **정확히 동일하게** 사용해야 함
    ```javascript
    import { feature1, feature2 } from "./routers/globalRouter";
    ```
  - 한 file(module)에서 두 가지 방법으로 export 가능

    ```javascript
    // ModuleA.js
    export const feat1 = () => console.log("feature1");
    export const feat2 = () => console.log("feature2");
    const defaultFeat = () => console.log("default feature");
    export default defaultFeat;

    // ModuleB.js
    import defaultFeature from "ModuleA";
    import { feat1, feat2 } from "ModuleA";
    ```

### Router 분리

- `server.js`로부터 각 router를 분리
- Router를 분리하면 `server.js`에서는 router를 단순히 import한 뒤 `use()`로 등록하기만 할 뿐
- 즉, `server.js`에서는 들어오는 request를 group에 맞게 routing 해 주는 역할만 함
- 상세 request URL에 대한 처리는 해당 group의 router가 담당
- `userRouter.js` export 예시

  ```javascript
  // File은 독립된 module이므로 express를 개별적으로 import 해야 함
  import express from "express";

  const router = express.Router();
  router.get("/edit", (req, res) => res.send("Edit User"));
  router.get("/delete", (req, res) => res.send("Delete User"));

  export default router; // Export user router
  ```

- `server.js` import 예시
  ```javascript
  // `server.js`로부터 `userRouter.js` 모듈의 위치를 상대 경로로 참조
  import userRouter from "./routers/userRouter.js";
  // main application에 router를 middleware로 등록
  app.use("/users", userRouter);
  ```

### Controller 분리

- Router에서 response를 보내는 처리 (business logic?)는 controller가 담당
- Router는 routing을 담당할 뿐, business logic과 관심사가 분리되어 있음
- 즉, controller도 router로부터 분리하는게 좋다.
  - Global controller는 굳이 분리하지 않음
  - Global router에서 처리하는 logic은 user 또는 video controller에 해당할 것
- 분리 예시

  ```javascript
  // userController.js
  export const join = (req, res) => res.send("Join");
  export const edit = (req, res) => res.send("Edit User");
  export const remove = (req, res) => res.send("Remove User");

  // userRouter.js
  import { edit, remove } from "../controllers/userController";
  router.get("/edit", edit);
  router.get("/remove", remove);
  export default router;

  // server.js
  import userRouter from ("./routers/userRouter");
  app.use("/users", userRouter);
  ```

## Planning Routes

- User 입장에서 고민
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

## URL Parameters

- `:{name}` : URL에서 동적으로 변경될 수 있는 parameter (URL 변수)
- Request의 `params`로 매칭된 parameter 값들을 받을 수 있음
- `/videos/:id` router로 `/videos/123` URL request를 받을 때 예시
  ```javascript
  const controller = (req, res) => {
    console.log(req.params); // { id : 123 }
    return res.end();
  };
  videoRouter.get("/:id", controller);
  ```
- Parameter를 사용할 때, router 순서에 따라 특정 URL로 routing하지 못하는 문제가 생김
  ```javascript
  // ❌ : `/upload` URL이 `:id` parameter에 매칭되는 문제가 생김
  router.get("/:id", see);
  router.get("/upload", upload);
  ```
- 문제 해결 방법
  1. 문제가 생기는 parameter를 가진 URL의 routing의 순서를 뒤로 조정
     ```javascript
     // `/upload` URL은 정상적으로 upload 동작 수행
     // path가 `upload`가 아닌 다른 URL에 대해 parameter 매칭 (e.g. /123)
     router.get("/upload", upload);
     router.get("/:id", see);
     ```
  2. Parameter에 **매칭될 수 있는 값에 제약** 추가
     - Express는 route URL에 **정규식** 패턴을 사용할 수 있음
     - URL parameter 뒤에 소괄호(`()`)로 regex 입력
       - 숫자로 된 id만 받고 싶다면, `/:id(\\d+)` URL로 routing
         ```javascript
         router.get("/:id(\\d+))", watch);
         router.get("/upload", upload);
         ```
       - (db 추가 후) MongoDB가 부여하는 id는 24byte hex string이므로, 이에 맞는 regex 입력
         ```js
         router.get("/:id([0-9a-f]{24})", watch);
         ```
     - 정규식으로 제약을 걸면, `id` 자리에 문자열이 올 때는 parameter에 매칭되지 않으므로 `/upload`에 정상적으로 접근
     - `id`는 없어도 동작하지만, `request.params`에서 가져오기 위해 이름 필요
