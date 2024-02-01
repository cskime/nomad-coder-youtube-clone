# Express Flash

- `express-flash` package : flash message를 template을 통해 사용자에게 보여주는 middleware 생성
- Middleware를 사용하면 `req` object에 `flash(type, message)` method를 추가해 줌
- `req.flash(type, message)`에 설정한 message는 `res.locals.messages`에 저장됨
- `locals`는 view template에서 접근할 수 있으므로, `.pug` 안에서 `messages.{type}`으로 message를 사용할 수 있음
- Message가 view에 한 번 표시되고 나면 cache에서 삭제함
  - refersh하면 data에 접근할 수 없음
  - 1회성으로 사용하므로 "flash" message
- Session에 기반하므로 특정 사용자만 볼 수 있다.
  - Session이 없으면 `flash()` method 호출 시 error가 발생한다.

## 사용 방법

- `express-flash` package 설치
  - `npm i express-flash`
- `express-flash`를 import하고 middleware 생성
  ```js
  import flash from "express-flash";
  ...
  app.use(flash());
  ```
- 다른 middleware와 controller에서 이 method를 호출해서 사용자에게 남길 message 정의
  - 승인되지 않은 route로 접근하거나,
  - 필요한 data를 찾지 못했거나,
  - error가 발생하는 경우,
  - `req.flash(type,message)`를 호출 (사용자에게 message를 보내야 하는 경우, e.g. redirect 해야 하는 경우)
    ```js
    req.flash("error", "Not authorized.");
    ```
- View template에서 `messages.{type}으로 접근`
  ```pug
  if messages.error
      span=messages.error
  ```
