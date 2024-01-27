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
- 내부 `<input>`의 attribute 설정
  - `<form>` 안에서 submit이 발생하면 내부 `<input>`에서 `name`과 `value` attribute에 설정된 값들이 parameter로 전달됨
  - Parameter들은 method에 따라 다른 방식으로 request에 담겨 backend로 전송
  - GET : URL에 추가됨 (`?name=value&name2=value2`)
  - POST : HTTP request의 body에 추가됨
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

## Absolute vs. Relative Path

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
