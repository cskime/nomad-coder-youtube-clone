# MongoDB & Mongoose

- `express-session`은 session을 memory에 저장하므로 서버가 재시작되면 이전에 생성된 session들이 초기화됨
- Data가 서버의 생명 주기와 독립적으로 유지될 수 있도록 외부 database에 저장

## MongoDB

- Document-based database
- Document : JSON like object
- 관계형 table에 row 단위로 데이터를 저장하던 기존 RDBMS와 달리 data를 **document 단위**로 저장하고 query 할 수 있음

### 설치

- `mongodb-community` npm package 설치 (무료 버전)
  ```shell
  brew-tap mongodb/brew
  brew update
  brew install mongodb-community@7.0
  ```
- `mongod` : 설치 확인
- Error 해결
  ```
  DeprecationWarning: The `punycode` module is deprecated.
  Please use a userland alternative instead.
  (Use `node --trace-deprecation ...` to show where the warning was created)
  ```
  - `brew services list`의 목록에서 `mongodb-community`의 status가 `none`으로 되어 있음
  - `brew services restart mongodb-community` 실행 후 `mongosh` 다시 실행하면 해결

### 사용 방법

- `mongosh` : Database server 실행
  - 서버 실행 후 출력되는 `mongodb://~` URL을 통해 database에 접속
- `show dbs` : database 목록 조회
  ```
  admin   40.00 KiB
  config  60.00 KiB
  local   40.00 KiB
  ```
- `use {DB_NAME}` : Database 접속
- `show collections` : 현재 database에 존재하는 collection 목록 조회
  - Collection : NoSQL database들이 사용하는 단위
  - Database > Collection > Document
- `db.{COLLECTION_NAME}.find(filter)` : Collection data 조회
- `db.{COLLECTION_NAME}.deleteMany(filter)` : Collection data 삭제

## Mongoose

- MongoDB의 부족한 기능을 보완하는 Javascript library
- MongoDB는 Javascript driver인 `mongodb`를 제공하지만, `mongoose`가 편리한 기능을 더 가지고 있다.
  - MongoDB의 document와 Javascript object의 1:1 mapping
  - Releation 기능 지원

### 설치 및 설정

- `mongoose` npm package 설치
  ```shell
  npm i mongoose
  ```
- `connect()` : Database 접속
  ```js
  import mongoose from "mongoose";
  mongoose.connect("{MONGODB_URL}/{DATABASE_NAME}"); // MongoDB 실행 시 출력되는 URL
  ```
- `on(event, handler)` : Database에서 발생하는 event 처리 handler 등록
  ```js
  mongoose.connection.once("error", (error) => console.log("DB Error", error));
  ```
- `once(event, handler)` : Database에서 한 번만 발생하는 event 처리 handler 등록
  ```js
  mongoose.connection.once("open", () => console.log("Connected to DB"));
  ```

### Model과 Schema

- Model
  - MongoDB와 interacting하는 class
  - **Model의 instance == Document**
- Schema
  - Model의 구조와 data type 및 option들을 정의한 object
  - Model에 저장되는 값들을 schema 설정을 통해 **validation**
- Schema를 사용해서 Model class 생성

  ```js
  const videoSchema = new mongoose.Schema({
    title: String, // shortcut
    description: { type: String, required: true, maxLength: 200 }, // define the type with options
    hashtags: [String], // list of string
  });

  // Model 이름과 생성된 model class 이름을 동일하게 사용하면 편하다.
  // Model class 이름을 대문자로 시작하게 만들면 편하다. (Class 또는 생성자 함수로 쉽게 이해됨)
  const Video = mongoose.model("Video", videoSchema);
  ```

  - Available schema types
    - `String`, `Number`, `Boolean`, `Array`, `Date`...
  - Available options example:
    - `required` : Boolean or function, adds a required validator for this property
    - `default` : Any or function, sets a default value for the path
    - `lowercase` : Boolean, always call `.toLowerCase()` on the value
    - `uppercase` : Boolean, always call `.toUpperCase()` on the value
    - `trim` : Boolean, always call `.trim()` on the value
    - `match` : RegEx,
    - `maxLength` : Number, checks if the value length is not less than the given number
    - `minLength` : Number, checks if the value length is not greater than the given number

- Model instance(document) 생성
  ```js
  const video = new Video({
    title: "My Video",
    description: "This is a description.",
    hashtags: ["these", "are", "hashtags"],
  });
  ```

### CRUD

- CRUD : Database와 data의 동작
  - Create : database에 data 생성(저장)
  - Read : database에 저장된 data 읽기
  - Update : database에 저장된 data 변경
  - Delete : database에서 data 삭제
- CRUD는 model을 통해 이루어진다.
- Create
  1. Document 생성 후 저장(`document.save()`)
     ```js
     const video = new Video({ ... });
     await video.save();
     ```
  2. `Model.create(object)`로 생성과 동시에 저장
     ```js
     await Video.create({ ... })
     ```
- Read
  1. `Model.find(filter)` : `filter` 조건을 만족하는 모든 document 가져오기
     ```js
     const keyword = "wow";
     const videos = await Video.find({
       title: { $regex: new RegExp(`^${keyword}`, "i") },
     });
     ```
  2. `Model.findOne(condition)` : `condition`을 만족하는 첫 번째 document 가져오기
  ```js
  await Model.findOne({ key: value }).exec();
  ```
  3. `Model.findById(id)` : mongoose가 생성한 `id` 값으로 document 가져오기 (unique)
     ```js
     const video = await Video.findById(_id);
     ```
  4. `Model.exists(filter)` : `filter` 조건을 만족하는 document를 database 내부에서 찾고 결과를 `boolean`으로 반환
     ```js
     const isExist = await Model.exist({ _id: id });
     if (!isExist) {
       return res.render("404", { pageTitle: "Video not found." });
     }
     ```
     - Document를 실제로 사용하지 않고 단순히 존재하는지 확인하는 용도로 사용
- Update
  1. `updateOne(filter, update)` : `filter` 조건을 만족하는 첫 번째 document에 `update` 적용
  2. `updateMany(filter, update)` : `filter` 조건을 만족하는 모든 document에 `update` 적용
  3. `findByIdAndUpdate(id, update)` : `id`로 document를 찾아서 `update` 적용
     ```js
     await Video.findByIdAndUpdate(_id, { title: "Other Title" });
     ```
- Delete
  1. `deleteOne(conditions)` : `conditions`을 만족하는 첫 번째 document 삭제
  2. `deleteMany(conditions)` : `conditions`을 만족하는 모든 document 삭제
  3. `findByIdAndDelete(id)` : `id`로 document를 찾아서 삭제
     ```js
     await Video.findByIdAndDelete(id);
     ```

### Queries

- MongoDB의 좋은 query 성능을 사용할 수 있음
- `sort(arg)` : database에서 가져온 query를 arg로 전달한 조건에 따라 정렬해서 반환
  ```js
  // { 정렬할 기준 field: "asc" or "desc" }
  const videos = await Video.find({}).sort({ createdAt: "desc" });
  ```
  - 오름차순 : `"asc"` or `-1`
  - 내림차순 : `"desc"` or `1`
- `exec()` : Query를 실제로 실행해서 Javascript의 pure Promise 반환
  ```js
  const videos = Video.find({}).exec();
  ```
  - `exec()`을 실행하지 않아도 동작에는 차이가 없다.

### Operators

- `$regex`
- `$or`
- `$nor`

### Middlewares

- Midldeware 또는 Pre/Post hooks
- Mongoose의 *asynchronous function*이 실행되는 동안 특정 시점에 실행되는 function들
- Query의 실행 전/후 시점에 실행되는 middleware를 사용할 수 있다.
- Schema level에서 **Model 생성 전**에 정의해야 한다.
- Middleware types
  - Document middleware : `validate`, `save`, `remove`, `updateOne`, `deleteOne`
  - Query middleware : `count~`, `find~`, `delete~`, `update~`, `remove`, `replaceOne`, `validate` 등
  - Aggregate middleware : `aggregate`
  - Model middleware : `insertMany`
- `pre(function, callback)` : `function`이 호출되기 **전(pre)**에 `callback` 실행
  ```js
  videoSchema.pre("save", async function (next) {
    this.hashtags = this.hashtags[0]
      .split(",")
      .map((word) => w(word.startsWith("#") ? word : `#${word}`));
  });
  ```
- `post(function, callback)` : `function`이 호출된 **후(post)**에 `callback` 실행

### Static Functions

Model class에서 호출할 수 있는 사용자 정의 static function을 추가할 수 있다.

```js
/* Define */
videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

/* Usage */
await Video.findByIdAndUpdate(id, {
  title,
  description,
  hashtags: Video.formatHashtags(hashtags), // 사용자 정의 static function 호출
});
```

### Population

- Population is the process of **automatically replacing** the specified paths in the document with document(s) from other collection(s).
- 두 model 사이에 연관 관계(relationship)를 만들어서 서로의 data를 쉽게 가져올 수 있다.
- Pouplation을 사용하지 않으면, 아래와 같은 작업이 추가로 필요하다.
  - 각 model에 연관된 model의 `id`를 저장하고
  - 필요할 때 `id`를 통해 해당 model의 document를 찾아온다.
- Population을 사용하면,
  - `id`를 저장한 field의 값이 `id`에 해당하는 document data로 **치환**된다.
  - **Database를 두 번 조회하지 않아도 된다.**
- 사용 예시
  - `Video`와 `User` model 간에 연관 관계
    - `User` model은 여러 개의 `Video` model에 연관됨 (1:n 관계)
    - `Video` model은 하나의 `User` model에 연관됨 (1:1 관계)
  - `Video`와 `User` model에 연관 field를 추가한다.
    ```js
     Schema에서 type을 `ObjectId`로 설정하고 `rel`에 관련된 model 지정
    const userSchema = new mongoose.Schema({
        ...,
        videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video"} ]
    })
    const videoSchema = new mongoose.Schema({
        ...,
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User"}
    })
    ```
    - 연관 field의 `type`에는 mongoose의 `ObjectId`를 사용한다.
    - 연관 field의 `ref`에는 연관된 다른 model의 이름을 사용한다. -> **Model 생성 시 사용하는 이름과 일치**해야 한다.
  - 각 Model의 document를 가져올 때 `populate(field)`를 호출한다.
    ```js
    export const watch = async (req, res) => {
        // `Video` model의 `owner` field 값을 `User` object로 치환
        const video = await Video.findById(req.params.id).populate("owner");
        ...
    }
    export const see = async (req, res) => {
        // `User` model의 `videos` field 값을 `Video` object array로 치환
        const user = await User.findById(req.params.id).populate("videos");
        ...
    }
    ```
- 치환된 data
  - Before
    ```
    {
        _id: ObjectId('65af5531d8f1745e730e7699'),
        title: 'Bunny',
        fileUrl: 'uploads/videos/f577128ba5d187b9372f195abc34636c',
        description: 'Bunny is eating carrots!',
        createdAt: ISODate('2024-01-23T05:57:05.342Z'),
        hashtags: [ '#bunny' ],
        meta: { views: 0, rating: 0 },
        owner: ObjectId('65af548ad8e2b56adceec83d'),
        __v: 0
    }
    ```
  - After
    ```
    {
        _id: ObjectId('65af5531d8f1745e730e7699'),
        title: 'Bunny',
        fileUrl: 'uploads/videos/f577128ba5d187b9372f195abc34636c',
        description: 'Bunny is eating carrots!',
        createdAt: ISODate('2024-01-23T05:57:05.342Z'),
        hashtags: [ '#bunny' ],
        meta: { views: 0, rating: 0 },
        owner: {
            _id: ObjectId('65af548ad8e2b56adceec83d'),
            email: 'kcsol1005@gmail.com',
            avatarUrl: 'https://avatars.githubusercontent.com/u/42177438?v=4',
            socialOnly: true,
            username: 'cskime',
            password: '$2b$05$KOfCaAoIkzZAYPKjXvR0IOfoTsjoG6qU7DdWjDSr0p6ZtdDL1xC3a',
            name: 'Chamsol Kim',
            location: 'Seoul, Korea',
            __v: 0
        }
        __v: 0
    }
    ```
    - `owner`의 값이 `ObjectId`와 일치하는 `User` model로 변경됨
