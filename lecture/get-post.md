# GET vs. POST

## Request Method: GET vs POST

- Method : Front와 back end 사이 data 전송 방식
- GET method
  - data를 요청해서 가져오는 request 방법
  - URL에 parameter가 추가된다.
  - 단순히 data를 가져올 때 사용 (e.g. search, fetch some data)
- POST method
  - 파일을 보내거나 database의 값을 변경하는 request 방법
  - URL에 parameter가 추가되지 않는다.
  - Database에서 data를 변경할 때 사용 (e.g. edit, delete, update)

## `<form>` 동작 예시

- `<form>` 안에 있는 submit `<input>`을 누를 때 다른 `<input>` 값을 backend로 보내기
- `method` attribute 설정
  - `method="GET"` : 현재 URL로 GET request 전송
  - `method="POST"` : 현재 URL로 POST request 전송
- `action` attribute 설정
  - Submit 될 때 이동할 URL path 지정
  - `action="/some-path"` : absolute URL로 요청
  - `action="some-path"` : relative URL로 요청
  - [Absolute, relative path 차이](#absolute-vs-relative-path)
- 내부 `<input>`의 parameter 설정
  - `<form>` 안에서 submit이 발생하면 내부 `<input>`에 설정된 값들이 parameter로 사용됨
  - Parameter들은 method에 따라 다른 방식으로 request에 담겨 backend로 전송
  - `<input name="title" value="It's a title" />`일 때
    - `name` : parameter의 key로 사용
    - `value` : parameter의 value로 사용
- 아래와 같은 `<form>`에서
  ```html
  <!-- In a page with URL: localhost:4000/videos/:id/edit -->
  <form method="POST">
    <input type="text" name="title" placeholder="Video Title" required />
    <input type="submit" value="Save" />
  </form>
  ```
  - GET request는 `?name="value"` 형태로 URL에 parameter가 붙음
  - POST request는 URL에 parameter가 붙지 않음

### Absolute vs. Relative Path

- `<form>`에서 `action` attribute의 값에 path를 전달함
- `action="/some-path"` : absolute path로 동작
- `action="some-path"` : relative path로 동작
- `localhost:4000/some/page` URL에서 submit 하는 예시
  - absolute path : Base URL에 path 추가
    ```html
    <!-- `localhost:4000/some-path` URL로 요청 -->
    <form action="/some-path">
      <input type="text" required />
      <input type="submit" value="Submit" />
    </form>
    ```
  - relative path : Current URL에 path 추가
    ```html
    <!-- `localhost:4000/some/some-path` URL로 요청 -->
    <form action="some-path">
      <input type="text" required />
      <input type="submit" value="Submit" />
    </form>
    ```

## Express server에서 GET, POST request 구현

- `app` 또는 `router`에서 각 method별로 URL path와 controller 지정
  ```javascript
  import express from "express";
  const app = express();
  app.get("/some/path", getController);
  app.post("/some/path", postController);
  ```
- GET과 POST request의 **URL이 같을 때**
  - `app` 또는 `router`에서 `route(path)` method로 routing할 URL 지정
  - 이어서 `get()`, `post()` method로 각 request에 대한 controller 설정
  - 코드 예시
    ```javascript
    import express from "express";
    const router = express.Router();
    router.route("/some/path").get(getController).post(postController);
    ```

### Redirect

- 특정 URL로 request가 오면, 다른 URL로 보내는 것
- POST request를 받고 data 변경 작업이 완료된 후 다른 화면을 보여줄 때 사용할 수 있음
- Video 수정 화면에서 'Submit' 버튼을 누르면 다시 video watch 화면으로 돌아가는 예시
  ```javascript
  router.post("videos/1/edit", (req, res) => {
    const { id } = req.params;
    return res.redirect(`/videos/${id}`);
  });
  ```
- 브라우저 이동 경로 : `videos/1/edit` --(redirect)--> `/videos/1`

### urlencoded()

- `express.urlencoded(options)` : Express에서 income request의 body에 담겨오는 data(payload)를 parsing하는 middleware
- `options` 종류
  - `extended` : urlencoded body를 JSON처럼 사용할 수 있게 변환해 줌 (javascript object 형식으로)
  - `parameterLimit` : parameter 개수 제한
- 사용 예시
  ```javascript
  // 전역 middleware 이므로 router보다 먼저 등록되어야 한다.
  app.use(experss.urlencoded({ extended: true }));
  app.use("/", globalRouter);
  ```
