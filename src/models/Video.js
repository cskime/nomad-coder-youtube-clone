import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  fileUrl: { type: String, required: true },
  description: { type: String, required: true, trim: true, minLength: 20 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
  },

  /* [ Data type ]
   * - MongoDB에서 제공하는 `_id`는 `ObjectId` type
   * - 이 type은 기본으로 제공되는 type이 아니므로 직접 찾아 들어가야 한다.
   * - `mongoose.Schema.Types.ObjectId`
   *
   * [ Reference ]
   * - mongoose에게 owner에 _id를 저장하겠다고 알려주어야 함
   * - 어떤 model과 연결할지 알려주어야 함
   * - `Video` model은 `User` model과 연결될 것이므로 `ref: "User"`
   */
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

/*  [ Hashtag formatting 코드를 재사용하기 위한 방법 ]
    1. Middleware 활용
    2. 재사용 function 정의
    3. Static function 정의

    [ 장단점 ]
    1. Middleware
      - 장점 : 전처리 function을 직접 실행시키지 않아도 된다.
      - 단점 : 호출하고 있는 method에 따라 적절한 middleware를 사용하고 관리해야 한다.
    2. 재사용 function 정의
      - 장점 : 쉽고 직관적으로 코드를 재사용하는 방법
      - 단점 : 개별적으로 export해야 하므로 개수가 많아지면 일일이 관리하기 어려워진다.
    3. Static function 정의
      - 장점 : Model이 namespace 역할을 하므로 가독성이 높아지고 불필요한 export/import 코드가 없어진다.
      - 단점 : 전처리 function을 일일이 직접 호출해야 한다.
*/

/*  [ Middleware 활용 ] 
    - Upload video -> 새 data를 database에 저장 전에 hashtag formatting
      - `save` middleware 사용
      - `save()`로 model data 저장할 때 적용
      - `create()`도 내부적으로 `save()` 호출하므로 적용됨
    - Edit video -> Database에서 특정 data 변경 전에 hashtag formatting
      - `findOneAndUpdate` middleware 사용
      - `findOneAndUpdate()`로 model update할 때 적용
      - `findByIdAndUpdate()`도 내부적으로 `findOneAndUpdate()` 호출하므로 적용됨
*/
// videoSchema.pre("save", async function () {
//   this.hashtags = this.hashtags[0]
//     .split(",")
//     .map((word) => (word.startsWith("#") ? word : `#${word}`));
// });
// videoSchema.pre("findOneAndUpdate", async function () {
//   this._update.hashtags = this.hashtags[0]
//     .split(",")
//     .map((word) => (word.startsWith("#") ? word : `#${word}`));
// });

/*  [ 재사용 function 정의 ] 
    - `,`로 단어들을 구분하는 string 1개를 받아서 formatting하는 function 정의
    - 해당 function을 export해서 사용한다.
*/
// export const formatHashtags = (hashtags) =>
//   hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`));

/*  [ Static function 정의 ]
    - 일반 function을 정의하면 불편한 점이 있음
      - Video model을 import하고 있음에도 해당 function을 별도로 import 해야 함
      - 해당 function이 Video model에 속해있다는 것을 판단하기 어려움
    - Mongoose가 제공하는 Model prototype에 static function을 정의하는 API 사용
      - Default export 되고 있는 Model로부터 function을 호출할 수 있으므로 추가 import가 필요 없음
      - `Model.formatHashtags()` 형태로 호출하므로 해당 function이 Model에 관련되어 있다는 것을 쉽게 알 수 있음
      - 즉, namespace 역할을 함으로써 가독성을 향상시킬 수 있다.
*/
videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
