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
- Schema : 어떤 데이터가 어떤 타입으로 사용되는지 명시한 것
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
- Model 생성 시 이름과 schema 전달
  ```js
  // Model : schema definition에 기반해 생성될 data structure
  // Document : Model class의 instance
  const document = mongoose.model("Video", videoSchema);
  ```
  - Mongoose model의 이름을 만들 때 첫 글자를 대문자로 만드는 convention이 있음
  - Mongoose의 model class에 정의된 method를 사용할 때, Model type으로부터 호출하는 것 처럼 보이려고 하는듯..

### CRUD

- Model의 CRUD 작업
- Create
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

- `find()`

  - Database에서 가져온 documents 반환
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

### Exceptions and Validation

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

## Javascript 문법

### Promise와 callback

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
