# Database

- Server와 독립된 공간에 data를 저장하고 관리할 수 있는 database를 만든다.
- Server가 재실행 되더라도 이전 data들을 영구적으로 유지할 수 있다.

## MongoDB

- Document-based database (document : JSON like object)
- Document를 기반으로 검색, 수정, 삭제 등 기능 지원

### 설치 과정 ([macOS](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/))

- MongoDB 설치
  ```shell
  brew tap mongodb/brew
  brew update
  brew install mongodb-community@7.0
  ```
- `mongod` command로 설치 확인
- `mongosh` command로 database server 실행
- Script 입력기로 전환되고 `show dbs` 실행하면 database 목록이 나타나야 함
  ```
  admin   40.00 KiB
  config  60.00 KiB
  local   40.00 KiB
  ```
- 아래와 같은 error가 발생할 경우,
  ```
  DeprecationWarning: The `punycode` module is deprecated.
  Please use a userland alternative instead.
  (Use `node --trace-deprecation ...` to show where the warning was created)
  ```
  - `brew services list`의 목록에서 `mongodb-community`의 status가 `none`으로 되어 있음
  - `brew services restart mongodb-community` 실행 후 `mongosh` 다시 실행하면 해결

### Usage

- `show dbs` : database 목록 조회
- `use {db}` : database에 접속
- `show collections` : 현재 접속한 database에 저장된 collections 조회
  - `Video`라는 이름으로 model을 만들었다면, `videos` collection 생성
- `db.{collection}.find()` : data 조회

## Mongoose

- node.js에서 MongoDB를 사용할 수 있게 해 주는 package
- Install
  ```shell
  npm i mongoose
  ```
- Connect to MondoDB database
  ```js
  // database.js
  import mongoose from "mongoose";
  mongoose.connect("mongodb://127.0.0.1:27017/{DATABASE_NAME}");
  ```
  - MongoDB 실행 후 출력되는 server URL로 접속 (`connect()`)
  - 접속할 database 이름(`DATABASE_NAME`) 사용
- Connect the database to a server
  ```js
  // Import the database.js module
  import "./database";
  ```
  - File이 import되면 js 코드가 실행되며 db에 연결함
  - Server가 실행된 뒤 db가 실행됨 (db 연결이 더 느림)
- 사용 예시

  ```js
  import mongoose from "mongoose";

  mongoose.connect("mongodb://127.0.0.1:27017/wetube");

  const database = mongoose.connection;

  // on : 여러 번 발생할 수 있는 Event
  // on("error", handler) : error가 발생할 때 마다 handler 실행
  const handleError = (error) => console.log("DB Error", error);
  database.on("error", handleError);

  // once : 한 번만 발생하는 Event
  // once("open", handler) : connection이 열릴 때 handler가 한 번만 실행됨
  const handleOpen = () => console.log("Connected to DB");
  database.once("open", handleOpen);
  ```

### Schema와 Model

- Model : data를 다루는 객체
- Schema
  - 어떤 데이터가 어떤 타입으로 사용되는지 명시한 것
  - **Validation**을 위한 것
- Mongoose에 data schema 설정
  ```js
  // Video.js
  const videoSchema = new mongoose.Schema({
    title: String, // 제목
    description: String, // 설명
    createdAt: Date, // 생성 날짜
    hashtags: [String], // hashtag array
    meta: {
      views: Number, // 조회수
      rating: Number, // 평점
    },
  });
  ```
  - `Schema` 생성 시 definition을 `name: SchemaTypes` 형태로 제공
    - schema name : data 식별자
    - schema types
      - Type 직접 선언(e.g. `String`, `Number`, `Boolean`, `Array`, `Date`, ...)
      - Schema type property와 함께 object로 선언
        ```js
        const = schema = new Schema({
          name: {
            type: String,
            required: true,
            default: "anonymous"
          }
        })
        ```
      - Available options example:
        - `lowercase` : Boolean, always call `.toLowerCase()` on the value
        - `uppercase` : Boolean, always call `.toUpperCase()` on the value
        - `trim` : Boolean, always call `.trim()` on the value
        - `match` : RegEx,
        - `maxLength` : Number, checks if the value length is not less than the given number
        - `minLength` : Number, checks if the value length is not greater than the given number
- Model 생성 시 이름과 schema 전달
  ```js
  // Model : schema definition에 기반해 생성될 data structure
  // Document : Model class의 instance
  const Model = mongoose.model("Video", videoSchema);
  ```
  - Model의 이름(type)으로 사용되는 word는 첫 글자를 대문자로 사용
  - Model instance를 저장한 변수는 같은 이름을 가지기 때문에, 이와 구별하기 위한 것

## CRUD

### Create

- `new` 연산자와 함께 생성자 호출하여 model object 생성
  ```js
  const video = new Video({
    title: title,
    description: description,
    createdAt: Date.now(),
    hashtags: hashtags.split(",").map((word) => `#${word}`),
    meta: {
      views: 0,
      rating: 0,
    },
  });
  ```
  - 이 때, 미리 설정한 schema에 맞는 field와 type을 사용해야 함
  - Schema에서 정의한 field를 빼먹어도 model은 정상적으로 생성된다.
    ```js
    // title만 가지고 model을 만들지만 error가 발생하지 않음
    const video = new Video({
      title: title,
    });
    ```
    - 실수로 data를 넣지 않는 것을 방지하려면, scheme을 정의할 때 해당 field를 필수값으로 설정하거나,
      ```js
      const videoSchema = new mongoose.Schema({
        ...
        createdAt: { type: Date, required: true },
        ...
      });
      ```
    - 기본값을 설정해서 해당 field에 대응되는 값이 없을 때 기본값을 사용한다.
      ```js
      // Date.now()는 즉시 실행되므로, function만 전달하면 mongoose가 필요할 때 실행한다.
      const videoSchema = new mongoose.Schema({
        ...
        createdAt: { type: Date, default: Date.now },
        ...
      });
      ```
- `save()` method를 호출하여 model을 database에 저장
  ```js
  const newVideo = new Video({...});
  await newVideo.save();
  // or, take the model which is saved in database
  const saved = await newVideo.save();
  ```
  - Database writing을 기다리기 위해 `await` 사용
- `create()` : Javascript object 생성 후 `save()`로 database에 저장하는 것을 한 번에
  ```js
  await Video.create({...});
  ```

### Read

- `find({})`

  - Database에서 documents를 가져옴
  - v6.0부터 `find()`는 callback function을 받지 않으므로 `Promise`로 구현해야 함

    ```js
    // Callback method can't be accepted after v6.0
    Video.find({}, (error, videos) => {
      if (error) {
        console.log(error);
        return;
      }
      res.render("home", { pageTitle: "Home", videos });
    });

    // Use a Promise with try-catch for error handling
    try {
      const videos = await Video.find({});
      res.render("home", { pageTitle: "Home", videos });
    } catch (error) {
      console.log(error);
    }
    ```

  - 검색(find)할 때 사용할 filter 추가
    ```js
    Video.find({
      title: keyword; // `title` field 값이 keyword와 일치하는 document만 검색
      // or
      title: { // filter 사용
        $regex: new RegExp(keyword, "i") // Regular Extression으로 검색
        $gt: 3 // greater than 3
      }
    });
    ```
    - Regular expression을 사용해서 특정 단어를 포함하고 있는 data 등 복잡한 조건으로 검색 가능
    - RegEx option
      - `i` : ignore case
      - `g` : global
    - `$regex`
      - MongoDB의 Query operator
      - Regular expression을 사용해서 query할 수 있음
    - `RegExp` 사용 예시
      - `new RegExp(keyword, "i")` : case insensitive하게 keyword를 포함하는 모든 data를 찾음
      - `keyword$` : keyword라는 단어로 끝나는 것만 찾음
      - `^keywod` : keyword라는 단어로 시작하는 것만 찾음
  - `exec()`
    - `find~()` 호출한 뒤 chain할 수 있는 method
      ```js
      Model.find({})
        .exec() // return Promise
        .then(~);
      // or use await
      await Model.find({});
      ```
    - `Promise`를 반환하여 비동기 코드를 작성할 수 있다.
    - `async`, `await`을 사용한다면 `Promise`를 사용할 필요가 없으므로 생략 가능

- `findOne()` : 전달한 condition에 해당하는 model 검색
  ```js
  Model.findOne({ key: value }).exec();
  ```
- `findById()` : `id`로 model 검색
  ```js
  Model.findById(id).exec();
  ```
- `exist(filterObject)`
  - Query와 매칭되는 data가 database에 존재하는지 확인하고 `boolean` 반환
  - Model을 직접 사용할 것이 아니면 data를 `find~()`로 가져올 필요가 없다.
  - 사용 방법
    ```js
    // `_id` field의 값이 `id`인 data가 존재하는지 `true`/`false`로 반환
    const isExist = await Model.exist({ _id: id });
    ```

### Update

- `find~({})`로 model을 가져와서 field 수정 후 `save()`
- `findByIdAndUpdate()` : 이 과정을 한 번에 할 수 있는 축약형

### Delete

- `findByIdAndDelete()` : `find~({})`로 video를 찾아서 `delete()`하는 작업의 shortcut
- 과거 버전에서는 delete와 remove가 각각 존재했지만 최신 버전에서는 remove는 없음
  - 특별한 이유가 없으면 delete를 사용하라고 함
  - Remove는 rollback할 수 없다고 함

## Query

- MongoDB/Mongoose는 빠른 query 성능을 가짐
- `sort({})` : Database에서 가져온 결과 정렬
  ```js
  // { 정렬할 기준 field: "asc" or "desc" }
  const videos = await Video.find({}).sort({ createdAt: "desc" });
  ```

## Exceptions and Validation

- Mongoose는 실제 model data를 schema에서 지정한 타입에 대해 **유효성 검사** 수행
- Schema에 맞지 않는 type의 value를 사용하면 `ValidationError`가 발생한다.
  ```js
  const video = new Video({
    ...
    createdAt: "Date.now()" // Type: Date
    ...
  });
  ```
- `required: true`로 설정된 field에 값을 넣지 않으면 error가 발생한다.
  ```js
  const video = new Video({
    ...
    // createdAt: "Date.now()" // required value
    ...
  });
  ```
- `try-catch` 문법으로 error handling 필요

## Middleware

- Middleware 또는 "pre and post hooks" 라고 부르기도 함
- Schema level에서 정의 (**model을 생성하기 전에 설정이 완료되어야 한다.**)
- Database가 변경되기 이전(pre hook) 또는 이후(post hook) 실행될 function을 정의한다.
  - Express의 middleware : request가 발생했을 때 response 반환 전에 처리할 작업 수행
  - Mongoose의 middleware : database 변경 전/후로 처리할 작업 수행
- 4가지 middleware types : document, model, aggregate, query
- 각 middleware에 해당하는 function에 대해 `pre` 또는 `post` hooked function 정의
  - hooks
    - `pre()` : middleware 실행 **이전**에 hooked function 실행
    - `post()` : middleware 실행 **이후**에 hooked function 실행
    - Hooked function 안에서 `this` 식별자로 document instance 참조
  - Document middleware : `save`
    - Hooked function 안에서 `this`로 document 참조
  - Query middleware : `findOneAndUpdate`
    - `findByIdAndUpdate()` method는 내부적으로 `findoneAndUpdate()`를 호출함
    - 즉, 두 method 모두 실행 시 `findOneAndUpdate` middleware가 실행된다.
    - Hooked functino 안에서 `this._update`로 document 참조
- 사용 방법
  ```js
  // pre(name, function) : `name` function이 호출되기 "이전"에 function 실행
  schema.pre("save", function () { ... }); // `save()` 호출 시
  schema.pre("findOneAndUpdate", function () { ... }); // `findByIdAndUpdate()` 호출 시
  ```
- [Document](https://mongoosejs.com/docs/middleware.html)

## Static function

- `static(name, function)`으로 model에서 호출할 수 있는 static function을 직접 정의할 수 있다.
- Schema level에서 정의해야 함
- 사용 방법
  ```js
  schema.static("myFunction", function (param) { ... });
  ```
- [Document](https://mongoosejs.com/docs/guide.html#statics)

## Modularization

- Database 연결하는 코드를 별도 module로 분리 (`database.js`)
- Model을 생서어하는 코드를 별도 module로 분리 (`SomeModel.js`)
- Database, model, server 등 환경 초기화 담당 코드를 별도 module로 분리 (`init.js`)
- Express server를 설정하는 코드 분리 (`server.js`)
- 기존 app 시작점을 `server.js` -> `init.js`로 변경
  - `init.js`는 필요한 작업들을 순서대로 실행시켜 주는 역할
  - `init.js`는 database 연결, model 생성, server 생성이 모두 완료된 뒤 server를 시작함
    ```js
    // server.js
    import "./db";
    import "./models/video"; // import a model
    ```
    - Database와 model이 app 시작 전에 pre-compile 될 수 있도록 server 가장 처음에 import
    - Module import 시점에 해당 코드가 실제로 실행되면서 db연결 및 model object 생성

## Javascript: Promise와 callback

- 순서가 중요한 작업에서 실행과 동시에 결과가 반환되지 않는 작업들은 종료 시점을 알 수 있어야 함
  - Database에서 data를 가져올 때 지연시간이 발생할 수 있음
  - Data를 가져오는 작업이 끝나야 그 data를 가지고 다른 작업을 시작할 수 있음 (e.g. UI rendering)
- Callback
  - 어떤 작업을 기다리다가 해당 작업이 끝난 뒤 실행되는 function
  - Function을 중첩해서 사용해야 하므로 가독성이 떨어진다.
- Promise
  - `async` : 비동기(asynchronouos) function을 만드는 keyword
  - `await` : async function 호출 시 값이 반환될 때 까지 실행을 대기시키는 keyword
  - `try-catch`로 error handling
