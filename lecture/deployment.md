# Deployment

## Build the Backend Server with `babel-cli`

- Backend code를 `babel-cli`를 사용해서 build
  - 개발할 때는 `babel-node`로 편하게 개발했지만,
  - 실제 배포할 때는 호환성을 가진 빠른 Javascript code를 서버에 배포해야 함
  - Build된 코드들은 **babel의 도움 없이** `node.js`가 모두 이해할 수 있음
- `package.json`에서 build script 추가
  ```json
  {
    ...
    "scripts": {
        "build:server": "babel src -d build",
        ...
    },
    ...
  }
  ```
  - `babel {INPUT} -d {OUTPUT}`
  - `INPUT` : 변환할 file 및 directory
  - `OUTPUT` : 변환된 file 및 directory (directory는 `-d` 옵션 사용)
- `npm run build:server`를 실행하면 `/build`에 변환된 Javascript file들이 생성된다.
- 변환된 코드(`/build`)는 `node`로 실행
  - 개발할 때는 최신 Javascript 문법을 사용해야 하므로 `babel-node`로 `init.js`를 실행했음
  - `babel-cli`에 의해 변환된 코드는 버전 호환성을 가진 코드이므로 `node`로 실행해도 된다.
  - `package.json`의 `script`에 build된 코드를 실행하는 script 추가
    ```json
    {
        ...,
        "scripts": {
            "start": "node build/init.js",
            ...,
        }
        ...,
    }
    ```
    - `start`는 npm의 기본 명령어이므로 `npm run start` 대신 `npm start`로 실행해도 됨

### View file 변환

- `babel-cli`를 실행하면 `/views/*.pug` 등 Javascript가 아닌 file들은 변환 결과에서 제외됨
- 하지만, 빌드된 코드를 실행하면 정상적으로 동작한다.
- Express에서 view template의 경로르 설정할 때,
  - `process.cwd() + "/src/views"`를 사용했고,
  - `process.cwd()`는 node.js가 실행되는 위치, 즉, `package.json`이 위치한 root 경로이므로
  - View template file들을 `/build` 밖에서 찾기 때문
-

### Client 코드 제외

- `/client`는 제외해야 함 -> client code는 **Webpack**이 번들링하면서 변환할 것

### Environment Variables

- Build된 server 코드가 환경 변수에 접근할 수 있음
- 환경 변수 파일(`.env`)도 root에 위치하고 있으므로 `/build`로 포함되지 않아도 정상 동작할 수 있다.

## Build the Client Code

- Client code를 상용 환경에 배포할 때 성능 향상을 위해 코드를 **압축**해야 함
- `webpack.config.js` 설정 변경
  - `mode`를 `production`으로 설정 -> bundling되는 코드를 압축해야함
  - `watch`를 설정하지 않음 -> 코드가 변경되는 것을 감지하고 다시 bundling하는 것이므로 상용에서 필요 없음

## Deployment (using Heroku)

- Server 배포 서비스
- Git history를 보고 실행하므로 변경사항을 commit해야 적용됨
- node.js, npm 등 개발 환경을 자동으로 감지해서 설정해줌
- Heroku에 업로드하거나, GitHub repository에 연동하면 origin repo에 push할 때 마다 Heroku가 history를 감지하고 다시 빌드
- `main` branch에 deploy되는 것이 감지되므로, branch를 나누는 전략이 필요할 것
  - `main` branch는 Stable version만 push하며 versioning

### Environment Variables

- `.env` 파일은 public/private 관계 없이 GitHub이나 기타 다른 server에 업로드 하면 안됨
- `.env`에 정의된 환경 변수들은 Heroku에서 환경 변수로 따로 등록해 주어야 한다.
  - `DB_URL`
  - `COOKIE_SECRET`
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`

### Port

- 개발할 때 사용한 4000번 Port는 임의로 지정한 것
- Heroku에서 랜덤으로 부여하는 Port를 사용하도록 수정해야 함
  ```js
  const PORT = process.env.PORT || 4000;
  ```
  - `process.env.PORT` : 상용 환경에서 Heroku에서 부여하는 `$PORT`를 사용하기 위함
  - 개발 환경에서는 환경 변수에 `process.env.PORT`가 존재하지 않으므로 4000번을 그대로 사용할 것

### GitHub 로그인

- 상용 환경을 위한 app과 개발 환경을 위한 test app을 만들어서 사용
- 상용 app에는 실제 domain(e.g. heroku) 사용
  - Client id 및 secret을 heroku의 config variables에 등록
- Test app에는 `localhost:4000` 등 local domain 사용
  - Client id 및 secret을 `.env`에 저장

## Mongoose Atlas

- 개발할 때 database는 localhost로 접속
- 배포한 뒤에는 모두가 접근할 수 있는 곳이어야 함
- MongoDB Atlas를 사용해서 웹으로 접근 가능한 cloud database 생성

### MongoDB Atlas 설정

1. Cluster 생성
2. User 생성
3. Native driver를 사용하고, IP Address 설정 -> `0.0.0.0/0` 설정 확인

## AWS S3

- Avatar image나 video들은 heroku website에 저장됨
- Commit을 push하면 서버가 다시 시작되면서 파일들이 모두 날아감
- File들을 **server와 독립된 공간**에 저장해야 한다.

### Setting

1. bucket 생성
2. API key 생성
   - node.js가 AWS와 통신할 때 필요
   - User를 추가해야 함
     - `Programmatic access` 선택 -> access key를 사용해서 로그인 할 수 있음
     - `AmazonS3FullAccess` 권한 선택 -> S3 file에 대해서만 권한을 줌
   - User를 생성하면 secret access key를 생성해 줌
   - 이 페이지는 한 번만 보여주기 때문에 key를 복사해서 잘 관리해야 한다.
3. Key 저장
   - `.env`에 `AWS_ID`, `AWS_SECRET` 저장 -> 잘 저장되는지 확인하는 용도
   - Heroku 등 server 배포 서비스에서 config variable로 등록

### S3로 File 업로드하기

1. AWS package 설치
   - `aws-sdk` : AWS를 사용하기 위해 필요한 sdk
   - `multer-s3` : `multer`를 사용해서 S3 bucket에 file을 upload 할 수 있게 함
2. s3 instance 생성
   ```js
   const s3 = new aws.S3({
     credentials: {
       accessKeyId: process.env.AWS_ID,
       secretAccessKey: process.env.AWS_SECRET,
     },
   });
   ```
3. S3로 file을 upload하는 uploader 생성
   ```js
   const multerUploader = multerS3({
     s3,
     bucket: "wetubeee", // S3 bucket name
   });
   ```
4. `multer`로 avatar 및 video를 업로드할 때 사용하는 middleware가 S3 storage로 file을 업로드하도록 수정
   ```js
   export const uploadAvatar = multer({
     dest: "uploads/avatars/",
     limits: { fileSize: 1 * 1024 },
     storage: multerUploader, // storage를 지정하면 `dest`와 s3 bucket에 모두 저장한다.
   });
   ```

### S3에 업로드한 image에 접근할 수 없는 문제

- File을 upload하면 해당 object가 공개되지 않아 접근할 수 없음
- 해결 방법
  1. Bucket permission에서 **ACL(Access Control List)**에 대해서는 public access block 설정을 해제한다.
  2. S3에 file을 업로드 할 때 ACL 권한을 `public-read`로 설정됨
  3. 이 때, s3의 file을 사용한다면 `file.path`가 아닌 `file.location`을 사용해야 함

### Heroku에서 작업할 때만 S3를 사용하도록 변경

- 개발 환경을 분리할 때 환경 변수를 사용한다.
- Heroku에서 `NODE_ENV`라는 config variable에 `production` 문자열을 담아줌
- 즉, `process.env.NODE_ENV === production`이 `true`이면 Heroku 환경인 것
- Heroku 환경이 아니라면 `multer` 설정에서 `storage` 값을 할당하지 않아야 함
