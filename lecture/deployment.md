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
