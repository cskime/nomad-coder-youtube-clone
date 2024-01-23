# File Upload

- `multer` : file upload를 위한 package

## Upload to server

- `multer`로 file을 upload하려면 encoding type이 `multipart/form-data`이어야 함
- `<form>`의 `enctype` attribute를 `multipart/form-data`로 설정
  ```html
  <form method="POST" enctype="multipart/form-data">
    <input type="file" name="avatar" accept="image/*" />
  </form>
  ```
  - `enctype` : file을 upload할 때 사용하는 encoding 방식 (encoding type)
  - `accept` : upload 할 수 있는 file 종류 제한 (`image/*` : 모든 image file)

## Receive from client

- Client가 upload한 file을 처리하는 middleware 생성
  ```js
  export const uploadFilesMiddleware = multer({ dest: "uploads/" });
  ```
  - `dest` : backend에서 upload된 file을 저장하는 경로
    - **생성되는 local path는 GitHub에 올리지 않음**
    - `multer`는 random name으로 image를 해당 경로에 저장
  - middleware의 역할
    1. 지정한 경로에 upload된 file 저장
    2. Request object에 upload된 file의 정보를 가진 `file` object 추가
- File을 upload하는 POST request가 도착하면 **controller 이전에** middleware 실행
  ```js
  userRouter
    .route("/edit")
    .post(uploadFilesMiddleware.single("avatar"), postEdit);
  ```
  - `single(fieldName)` : 단일 file upload
  - `fieldName` : client에서 file을 upload할 때 사용한 field name (file input의 `name` attribute)
- Controller에서 `req.file`로 upload된 file에 접근

  ```js
  export const postEdit = async (req, res) => {
    /*  [ File object ]
        {
          fieldname: "",
          originalname: "",
          encoding: "",
          mimetype: "",
          destination: "",
          filename: "",
          path: "",
          size: 0
        }
     */
    const {
      session: {
        user: { _id, avatarUrl }
      },
      body: { ... },
      file: { path },
    } = req;
    ...

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        /* File을 선택하지 않았을 때는 `file`이 `undefined`이므로
         * user 정보 update시 avatar를 업로드하지 않으면 session에 저장된 기본 avatar를 사용한다.
         */
        avatarUrl: file ? file.path : avatarUrl,
        ...
      },
      { new: true }
    )
    ...
  };
  ```

## Show an Image

- Image file path를 session에 저장하고(`avatarUrl`) `<img>` element로 표시
  ```html
  <!-- Multer가 upload된 파일을 저장하면서 만든 이름 -->
  <img src="/uploads/{IMAGE_FILE_NAME}>
  ```
- 이 때, 브라우저는 서버 파일에 접근할 수 없으므로 server가 image file url을 routing해서 브라우저에 반환해 주어야 함
- Static files serving : 폴더 전체를 브라우저에게 노출시키는 방법
  ```js
  app.use("/uploads", express.static("uploads"));
  ```
  - Express의 built-in middleware인 `static()`을 사용
  - `/uploads`로 요청이 들어오면 `uploads` 경로에 있는 file들을 보여준다.

## 주의

### DO NOT SAVE FILES TO DB DIRECTLY

- **File 자체를 database에 저장하지 않는다.**
- **File은 따로 저장하고, database에는 file의 location만 저장한다.**

### DO NOT SAVE FIELS TO SERVER

- Image를 서버에 직접 저장하면, 서버가 죽었을 때 파일들이 날아가므로 좋은 방법이 아님
- File들을 서버 외 다른 곳에 저장해야 서버가 죽었다 재시작해도 file들을 안전하게 보관할 수 있다.

## File Size 제한

- Multer Middleware를 만들 때 `limits` 옵션에 `fileSize` 지정 (bytes)
  ```js
  // avatar image와 video를 별도 directory에 저장하기 위해 middleware 분리
  export const uploadAvatar = multer({
    dest: "uploads/avatars/",
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB 업로드 제한
  });
  export const uploadVideo = multer({
    dest: "uploads/videos/",
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 업로드 제한
  });
  ```
- 지정한 file size보다 큰 이미지를 업로드하면 `MulterError: File too large` error 발생
  - 이 때 필요한 response 구현
