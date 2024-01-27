# Node.js & npm

## Node.js

- Javascript runtime environment built with chrome V8 javascript engine
  - Javascript는 원래 브라우저에서 상호작용을 위해 만들어진 언어
  - Javascript는 브라우저에 내장된 engine에 의해 브라우저에서만 실행할 수 있었다.
  - Chrome의 V8 engine을 사용해서 어떤 환경에서도 Javascript를 실행할 수 있게 만든 것
- Node.js 덕분에 React Native, Electron 등 모바일/데스크톱 앱을 만들 수 있음
- 사용자가 HTML/CSS/Javascript를 다운받아서 모바일/컴퓨터에서 실행 가능해짐

## npm(Node Package Manager)

- Package manager for javascript programming language
  - npm을 사용해서 다른 사람이 만든 Node.js package를 다운받고 설치하거나, 내가 만든 package를 공유할 수 있음
  - NodeJS를 설치할 때 함께 설치됨
- Node.js의 `node` 명령어는 거의 사용할 일이 없음. `npm` 명령어를 대부분 사용하게 됨
- 초기화
  - `npm init` : `package.json` 생성, npm project 초기화
  - `package.json` : nodeJS package 설정 파일
  - `scripts` : `npm`이 현재 package에서 실행할 수 있는 script 정의
  - `dependencies` : Package를 실행하기 위해 필요한 의존성 package
  - `devDependencies` : 개발자를 위한 의존성 (`--save-dev`)
- Package 설치
  - `npm i` : `package.json`에 명시된 의존성들을 설치함
  - `npm i {package_name}` : 해당 package 설치
  - `node_modules` : npm으로 package를 설치했을 때 파일이 저장되는 곳
- Package 실행
  - `npm run {script_name}` : `package.json`의 `scripts`에 작성한 script 실행

## package.json

- Node.js application의 설정 파일
- NodeJS package는 root에 `package.json` 파일이 있어야 함
  - NodeJS 프로젝를 만들 때 가장 먼저 만들어야 할 파일
- 작성해야 할 내용도 많고, 직접 만들면 실수할 수도 있으므로 template으로 생성한다.
  - 프로젝트 root에서 `npm init` 실행하면 `package.json` 파일을 만들어 줌

### script

- 모든 script를 일일이 실행하지 않아도 `package.json`의 `script`에 정의한 key로 script 실행
- 특정 script들을 조합해서 실행하는 등 복잡한 동작 가능
- `npm run {SCRIPT_NAME}` 명령어로 실행
  - `package.json` 파일이 있는 위치에서 실행해야 함
  - `package.json`의 `script`에 `npm`으로 실행할 script 작성
  - 이 package에서 사용할 수 있는 기능들을 여러 개 추가하는 것과 비슷
    - `npm run dev:server` : server 실행 script
    - `npm run dev:asset` : bundling script

### Packages

- `npm` 명령어로 다른 package 설치
  - `npm install {PACKAGE_NAME}` or `npm i {PACKAGE_NAME}` : 특정 package 직접 설치
  - `npm install` or `npm i` : 명시된 dependency를 모두 설치
- Package를 설치하면 일어나는 일
  - `package-lock.json` 파일 생성
    - 설치해야 하는 package들을 버전에 맞게 안전하게 관리해 줌
    - **항상 같은 버전의 package가 설치**될 것을 보장함
    - `package.json`, `package-lock.js`, `index.js`만 공유하면 상대방이 프로젝트를 실행할 수 있다.
  - `node_module` 생성
    - `npm`으로 설치한 package들의 source file이 저장되는 곳
    - 설치한 package의 dependency까지 모두 설치됨
      - Dependency : 어떤 package(e.g. Express)가 작동할 때 필요한 다른 package
      - `npm install`은 특정 package 및 해당 package의 dependency를 모두 찾아서 설치해 준다.
    - `node_module`은 github에 push되지 않도록 `.gitignore`에 추가
  - 의존성 추가 (`dependencies` 및 `devDependencies`)
    ```json
    {
      ...
      "dependencies": {
        "express": "^4.17.1"
      }
    }
    ```
    - `package.json`의 `dependencies` 및 `devDependencies`에 설치한 package 목록과 버전 정보 추가
    - 설치한 package가 내가 만든 package의 dependency로 추가됨
    - 내 node project를 실행하려면 `dependencies`에 명시된 package들을 먼저 설치해야 함
    - `devDependencies`는 개발할 때에만 필요한 dependency로, package 설치 시 `--save-dev` 또는 `-D` 옵션 추가

## iOS의 Cocoapods와 비교

- `package.json` == `Podfile`
- `package-lock.json` == `Podfile.lock`
- `npm install` == `pod install`
- `node_modules` == `Pods`
