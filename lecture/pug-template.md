# HTML Template with Pug

## Response로 HTML 반환하는 방법

- HTML text 전송 -> 모든 HTML을 일일이 문자열로 작성하기 어렵고 확장성도 떨어짐
  ```javascript
  res.send("<h1>Hello</h1>");
  ```
- Express의 rendering 기능 사용 : Rendering된 HTML을 직접 반환 -> Pug 등 라이브러리 사용
  ```javascript
  const controller = (req, res) => res.render("home");
  ```

## Express Application Setting

- Express application은 `app.set()`으로 몇 가지 속성을 설정할 수 있음 ([ref](https://expressjs.com/en/4x/api.html#app.set))
- `view engine`
  - Express app이 view를 rendering할 때 사용하는 engine
  - `response.render(filename, option)`으로 view file을 렌더링한 후 응답으로 반환
    - `filename` : View code를 작성한 file 이름
    - `option` : View code에 전달할 option
- `views`
  - Express app이 rendering에 사용하는 view file을 찾는 경로
  - 기본값 : `process.cwd() + /views`
    - cwd : current working directory
    - cwd는 node.js 및 express server를 실행시키는 위치, 즉, `package.json`이 위치한 경로

## [Pug](https://www.npmjs.com/package/pug)

- HTML을 template 문법을 사용해서 작성할 수 있게 해 주는 라이브러리
- HTML을 깔끔하게 사용할 수 있음
- HTML에 javascript를 넣을 수 있음
  ```js
  footer &copy; #{new Date().getFullYear()} Wetube
  ```
- 반복되는 HTML 코드를 재사용 할 수 있음 (`include`)
- `~.pug` file에 작성한 template을 HTML로 rendering함

### Set up the rendering engine of Express as Pug

```javascript
app.set("view engine", "pub");
```

### Set up the view files directory

- 모든 source file을 `/src`에 넣을 것이므로, `/src/views` 경로에 `~.pug` 파일 작성
- Express의 view files directory를 `/src/views` 경로로 변경해야 함
- 설정 방법
  ```javascript
  app.set("views", process.cwd() + "/src/views");
  ```

### Return a response with a rendered HTML by Pug

- Controller에서 `response.render()`에 `~.pug` 파일 이름을 넣어서 반환한다.
  ```javascript
  const controller = (req, res) => res.render("home");
  ```

### Partial

- 중복되는 코드를 재사용할 수 있게 분리하는 것(separate into partial things)
  - Component : 반복되어 재사용될 수 있는 HTML block
  - 즉, **HTML block을 component화** 할 수 있는 기능이다.
- [include](https://pugjs.org/language/includes.html)
  - Pug file에 작성한 코드를 불러와서 `include` 키워드가 있는 곳에 붙여넣음
  - 중복되는 코드를 별도의 file로 분리하고
    ```pug
    // footer.pug
    footer &copy; #{new Date().getFullYear()} Wetube
    ```
  - 재사용하려는 곳에서 `include {PATH}` 키워드로 해당 file에 작성된 코드를 붙여넣는다.
    ```pug
    doctype html
    head
    body
        h1 hello
        include footer
    ```
    - Pug file을 찾기 때문에 `.pug`는 붙이지 않아도 됨
- [mixins](https://pugjs.org/language/mixins.html)

  - `include`는 file content를 붙여넣지만, `mixin`은 HTML block을 붙여넣음
  - `include`와 달리 mixin block 안으로 **data를 전달할 수 있음**
  - `mixin` 키워드를 사용해서 mixin block을 정의하고
    ```pug
    mixin mixinFunction(data)
        h1=data
    ```
  - `+` 키워드로 mixin function을 호출한다.
    ```pug
    h2 Some content
    +mixinFunction("data1")
    +mixinFunction("data2")
    ```
  - Mixin 정의 부분을 다른 파일로 분리하고,
    ```pug
    // mixins/video.pug
    mixin videoInfo(data)
        div
            h4=data.title
            ul
              li #{video.rating}/5.
              ...
    ```
  - `include`로 불러와 사용할 수도 있다.
    ```pug
    include mixins/video
    ul
        each video in videos
            +videoInfo(video)
    ```
    - mixin definition을 맨 위에 넣어야 밑에서 사용할 수 있음

### [Extends and Blocks](https://pugjs.org/language/inheritance.html)

- `extends`
  - 다른 `.pug` 파일을 확장해서 사용하는 것
  - 상속(inheritance)과 비슷하게 동작
  - `~.pug` file들은 base template을 확장(extend)해서 view를 만듦
- `block` : 확장한 `.pug` 파일이 base file에 content를 채워 넣을 수 있는 방법
- 사용 방법
  - Base template에서 동적으로 content를 바꿔 넣을 부분에 `block {name}` 입력
    ```pug
    doctype html
    html(lang="ko")
        head
            title Wetube
        body
            block content
            include partials/footer.pug
    ```
  - Sub template에서 `block {name}`에 들어갈 HTML template 작성
    ```javascript
    extends base.pug
    block content
        h1 Home!
    ```

### [Interpolcation](https://pugjs.org/language/interpolation.html)

- `#{name}` : data 삽입 operator
- `.pug` file 안에서 특정 부분에 data를 다르게 하고 싶을 때 사용
- 해당 `.pug` file을 rendering할 때 data를 주입한다. (함수의 parameter와 비슷)
- 사용 방법
  - Data를 동적으로 바꾸고 싶은 곳에 변수를 선언하고
    ```pug
    doctype html
    html(lang="ko")
        head
            title #{pageTitle} | Wetube
        body
            block content
            include partials/footer.pug
    ```
  - Template을 렌더링할 때 `option` object로 변수의 값을 전달한다.
    ```javascript
    const controller = (req, res) => res.render("home", { pageTitle: "Home" });
    ```
- `=` 연산자와 차이
  - `={variable}` : 특정 element에 variable 1개만 할당할 때 (`=` 뒤에 오는 text를 variable로 인식)
    ```pug
    h1=pageTitle
    ```
  - `#{variable}` : variable을 다른 text들과 함께 사용하거나 내부에 삽입(interpolate)할 때
    ```pug
    h1 #{pageTitle} | Wetube
    ```
- Attribute value로 사용할 수는 없다. 이 때는 javascript의 String template 사용
  ```javascript
  a(href=`/videos/${video.id}`) #{video.title}
  ```

### [Conditional](https://pugjs.org/language/conditionals.html)

- Pug template에 conditional 문법 사용 (`if`)
  ```pug
  ul
    if fakeUser.isLoggedIn
        li
            a(href="/login") Logout
    else
        li
            a(href="/login") Login
  ```

### [Iteration](https://pugjs.org/language/iteration.html)

- List를 순회하는 문법 사용
- `each in else`
  ```pug
  ul
      each video in videos
          li=video
      else
          li Sorry nothing found.
  ```
  - array(`[]`), object(`{}`) 등 순회.
  - `else` : array or object가 비어있을 때 (has no item)
- `while`
