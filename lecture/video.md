# Relationship

- Mongoose가 지원하는 기능
- 두 model 사이에 연관 관계(relationship)를 만들어서 서로의 data를 쉽게 가져올 수 있는 방법
- `Video` model과 `User` model 사이의 relationship
  - Video를 볼 때 upload한 사람을 알 수 있어야 함
  - 사용자는 profile에서 자신이 upload한 video를 볼 수 있어야 함
- 즉, user와 video는 `1:n` 관계
  - `User` model은 `videos` field를 가짐 -> video의 id를 array로 저장
  - `Video` model은 `owner` field를 가짐 -> user id를 저장
- Relationship을 사용하지 않으면 id로 다른 model을 직접 database에서 찾아와야 함
  ```js
  // Video page
  export const watch = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id); // 보여주려는 video 검색
    const user = await User.findById(video.owner); // 해당 video를 upload한 사람(owner) 검색
  };
  ```
- Relationship 관계를 이용하면 `populate()` method를 사용해서 자동으로 **연관된 data로 값을 치환**해 줌
- 사용 방법
  1. Field에 relationship을 갖는 model 설정
     - `ref` :
       - 해당 field와 연결되는 model name 지정
       - Mongoose에게 이 field가 어떤 model과 연관되어 있는지 알려 줌
       - Database에서 가져온 model에서 `populate(field)`를 호출하면 relationship field의 값이 **연관 model data로 교체**됨
     - `Video` model : `owner` field로 `User` model 참조
       ```js
       // Video
       const videoSchema = new mongoose.Schema({
           ...
           owner: { type: String, required: true, ref: "User" },
       });
       ```
     - `User` model : `videos` field로 `Video` model array 참조
       ```js
       const userSchema = new mongoose.Schema({
           ...
           videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
       });
       ```
  2. Database에서 가져온 model에서 `populate(field)` method 사용
     ```js
     export const controller = async (req, res) => {
       const { id } = req.params;
       const video = await Video.findById(id).populate("owner"); // owner 값 변경: `ObejctId` -> `User` object
       const user = await User.findById(id).populate("videos"); // videos 값 변경: `[ObjectId]` -> `[Video]` array
     };
     ```
  3. 치환된 data
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
- Relationship이 없다면 연관된 model의 `id` 값으로 database에서 특정 model data를 다시 가져와야함
  ```js
  export const controller = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    const user = await User.findById(video.owner); // Video를 upload한 사람 찾기
  };
  ```
