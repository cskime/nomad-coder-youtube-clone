# Deployment

1. Build backend using babel
2. Build frontend using webpack
3.

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
- `/client`는 제외해야 함 -> client code는 **Webpack**이 번들링하면서 변환할 것

### Environment Variables

- Build된 server 코드가 환경 변수에 접근할 수 있음
- 환경 변수 파일(`.env`)도 root에 위치하고 있으므로 `/build`로 포함되지 않아도 정상 동작할 수 있다.

## Build the Client Code

- Client code를 상용 환경에 배포할 때 성능 향상을 위해 코드를 **압축**해야 함
- `webpack.config.js` 설정 변경
  - `mode`를 `production`으로 설정 -> bundling되는 코드를 압축해야함
  - `watch`를 설정하지 않음 -> 코드가 변경되는 것을 감지하고 다시 bundling하는 것이므로 상용에서 필요 없음

## Deployment

- Cloud에서 서버를 실행시키고 IP address를 부여해서 웹에서 접근 가능한 경로로 배포
- Node.js, npm 등 개발 환경을 자동으로 감지하고 설정해 줌
  - Node.js 환경에서는 `npm run build`로 빌드하고 `npm run start`로 서버 실행
  - 명령어들은 기본값을 변경해서 사용 가능
- GitHub repository를 연동해 두면 특정 branch에 새 commit을 push 할 때 마다 감지하고 서버 재시작
  - 배포용 branch를 분리해서 관리할 필요
  - `main` branch는 stable한 배포용 branch로만 사용
- Deplpyment Server 사용
  - https://cloudtype.io/ => 한국에서 만든 사이트라서 한국어로 배포할 수 있어 편함
  - https://fly.io/
  - https://render.com/
  - https://www.netlify.com/
  - https://cyclic.sh/

### Environment Variables

- `.env` 파일은 public/private 관계 없이 GitHub이나 기타 다른 server에 업로드 하면 안됨
- 하지만, backend를 실행할 때 환경 변수 값들은 반드시 필요하다.
  - `DB_URL`
  - `COOKIE_SECRET`
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `AWS_ID`
  - `AWS_SECRET`
- `.env`에 정의된 환경 변수들을 **배포 서비스의 환경 변수에 별도로 등록**해 주어야 한다. (config vars)

### MongoDB Database 연결

- 개발할 때 database의 URL은 localhost, 배포했을 때는 network를 통해 접근 가능해야 함
- MongoDB Atlas를 사용해서 웹으로 접근 가능한 cloud database 생성
  - Native driver로 연결
  - `mongodb+srv://<username>:<password>@cluster~` 형식의 database url을 얻음
  - 배포 서비스의 환경 변수에 `DB_URL`로 설정
  - IP Address를 `0.0.0.0/0`로 설정하여 누구나 접근할 수 있도록 설정

### Port

- 개발할 때 사용한 `4000`번 Port는 local 환경에서 임의로 지정한 것
- 배포 서비스를 사용하면 Port를 임의로 부여하므로, 환경에 따라 다른 port를 사용해야 한다.
  ```js
  const PORT = process.env.PORT || 4000;
  ```
  - 배포 서비스에서 임의로 할당한 port를 `process.env.PORT`에 저장함
  - `process.env.PORT`가 없다면 개발 환경이므로 `4000`번을 그대로 사용
  - 개발 환경에서도 `.env`에 port 번호를 정해두면 `process.env.PORT`만 사용할 수 있을 것

### GitHub 로그인 연동

- GitHub OAuth login을 위해 OAuth app을 만들 때 `http:localhost:4000`을 url로 사용
- 이것은 개발 환경에서만 유효하므로, 배포 후에는 호스팅된 URL로 변경해야 함
- 일일이 변경해야 하므로, OAuth app을 개발용/상용 두 개 만들어서 사용하면 편하다.
  - 개발용 app의 client id와 secret key는 `.env`에 저장
  - 상용 app의 client id와 secret key는 배포 서비스의 environment에 저장

### AWS S3 연동

- 업로드하는 image 및 video들은 server directory에 저장됨
- Server가 빌드될 때 마다 기존 directory를 초기화하므로, 업로드한 파일들이 유실된다.
- 따라서, File들을 **server와 독립된 공간**에 저장해야 한다.
- AWS S3 bucket을 많이 사용한다.
- S3 bucket 설정
  1. bucket 생성
  2. API key 생성 (from IAM - User)
     - Node.js가 AWS와 통신할 때 필요
     - IAM User 추가
       - Programmatic access 허용 -> access key로 로그인
       - Permission은 `AmazonS3FullAccess`만 부여 -> S3 file에 대해서만 권한을 줌
     - Access key 생성 -> Access key 및 Secret 생성
  3. 환경 변수로 key 등록
     - `AWS_ID` : Access key
     - `AWS_SECRET` : Secret
     - `.env`와 배포 서비스의 environment 모두 등록
- S3 storage와 연동 (v3.x.x 기준)
  1. AWS package 설치
     - `aws-sdk/client-s3` : AWS S3에 접근하기 위한 aws sdk
     - `multer-s3` : `multer`를 사용해서 S3 bucket에 file을 upload 할 수 있게 함
  2. S3 instance 생성
     ```js
     const s3 = new S3Client({
       region: "ap-northeast-2",
       credentials: {
         accessKeyId: process.env.AWS_ID,
         secretAccessKey: process.env.AWS_SECRET,
       },
     });
     ```
  3. S3로 file을 upload하는 uploader 생성
     ```js
     const s3VideoUploader = multerS3({
       s3,
       bucket: "wetubeckim", // S3 bucket name
       acl: "public-read", // ACL 설정
     });
     ```
  4. `multer`로 avatar 및 video를 업로드할 때 사용하는 middleware가 S3 storage로 file을 업로드하도록 수정
     ```js
     export const uploadAvatar = multer({
       dest: "uploads/avatars/",
       limits: { fileSize: 1 * 1024 },
       storage: s3VideoUploader, // storage를 지정하면 `dest`와 s3 bucket에 모두 저장한다.
     });
     ```

### S3에 업로드한 image에 접근할 수 없는 문제

- File을 upload하면 해당 object가 공개되지 않아 접근할 수 없음
- 해결 방법
  1. Bucket permission에서 **ACL(Access Control List)**에 대해서는 public access block 설정 해제
     - acl을 제공한 file에 한해 공개 공개 권한을 부여
  2. S3로 file을 업로드할 때 `acl` 부여 -> `public-read`로 설정
  3. 이 때, s3의 file을 사용한다면 `file.path`가 아닌 `file.location`을 사용해야 함

### Image 및 video file을 상용 환경에서만 S3에 업로드

- S3로 잘 업로드되는 것을 확인한 뒤로는 file들을 S3에 업로드할 필요가 없다.
- File을 업로드할 때 상용 환경에서만 S3 bucket에 저장되도록 해야 함
  - 상용 환경이 아니라면 굳이 S3에 저장하지 않아도 됨
  - `multer` 설정에서 `storage` 값을 할당하지 않으면 local 경로에 파일로 저장된다. -> _개발 환경_
- 개발 환경을 분리할 때 환경 변수를 사용한다.
  - Heroku 및 Render는 `NODE_ENV`라는 default environment value를 제공함
  - 이 key는 runtime에 `production` 문자열을 값으로 가짐
  - 따라서, `process.env.NODE_ENV === production`으로 현재 상용 환경임을 판단할 수 있다.
