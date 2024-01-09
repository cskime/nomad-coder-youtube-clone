# nodeJS bacic

## Overview

- nodeJS and npm
  - nodeJS
    - Javascript runtime environment built with chrome V8 javascript engine
    - 브라우저 밖에서 javascript 실행
  - npm : Node Package Manager
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
- Babel
  - `@babel/core` : Babel 기능 모음
  - `@babel/preset-env`, `babel.config.json` : babel이 최신 js 코드를 변환할 수 있게 함
  - `@babel/node` : babel을 nodeJS에서 사용할 수 있게 함
  - `@babel/nodemon` : 파일이 변경될 때 마다 restart

## nodeJS

- 크롬 V8 엔진으로 빌드된 Javascript runtime, 브라우저 밖에서 돌아가는 Javascript
  - Javascript는 원래 브라우저에서 상호작용을 위해 만들어진 언어
  - Javascript가 유명해지면서 javascript를 브라우저 밖에서 사용할 수 있게 만든 것
  - Javascript를 브라우저에서 분리
- NodeJS 다운로드 -> Javascript를 따로 다운받을 수 있게 된 것
- React Native, Electron 등 모바일/데스크톱 앱을 만들 수 있음
  - 사용자가 HTML/CSS/Javascript를 다운받아서 모바일/컴퓨터에서 실행 가능해짐

## npm

- Package manager for javascript programming language
  - npm은 NodeJS 패키지를 다운받고 설치할 수 있음
  - NodeJS를 설치할 때 함께 설치됨
  - `node` 명령어는 거의 사용할 일이 없음
  - `npm` 명령어를 대부분 사용하게 됨
- Package를 만들고 공유할 수 있음
  - e.g. Express

## Setup

### `package.json` 생성

- NodeJS package는 root에 `package.json` 파일이 있어야 함
  - 이름을 정확히 사용해야 함
  - NodeJS 프로젝를 만들 때 가장 먼저 만들어야 할 파일
- 작성해야 할 내용도 많고, 직접 만들면 실수할 수도 있으므로 생성한다.
  - 프로젝트 root에서 `npm init` 실행
  - `package.json` 파일을 만들어 줌
- `main`
  - 대표 파일. 기본값 `index.js`
  - 다른 사람들이 내 package를 설치해서 사용할 file을 지정하는 것

### script

- `node index.js` : Javascript 파일 실행
  - `node` 명령어 실행 전에 다른 작업을 할 수도 있음
  - `node` 명령어를 사용해서 실행하지 않을 것
- `npm` 명령어 사용
  - `package.json` 파일 위치에서 실행해야 함
  - `package.json`의 `script`에 `npm`으로 실행할 script 작성
  - 이 package에서 사용할 수 있는 기능들을 여러 개 추가하는 것과 비슷
  - Server 실행 script, CSS 압축 script 등 여러 개를 만들게 된다.
  - `npm run {script_name}`로 실행

### npm package 설치

- Package 설치 : `npm i {package_name}`
  - `i` : `install` 명령어 축약
  - Express 설치 : `npm i express`
- Package 설치 시 일어나는 일
  - `package-lock.json` 파일 생성
    - 설치된 package들을 안전하게 관리해 줌
    - Hash값으로 변경 여부 체크
    - 항상 **같은 버전의 package가 설치**될 것을 보장함
  - `node_module` 생성
    - `npm`으로 설치한 package 파일들이 저장되는 곳
    - 해당 package의 dependency가 함께 설치됨 -> `npm`의 install 명령어가 하는 작업
      - Dependency : 어떤 package(e.g. Express)가 작동할 때 필요한 다른 package
      - `package.json`의 `dependencies`에 명시`
  - `package.json`에 `dependencies` 생성
    - 설치한 package가 내가 만든 package의 dependency로 추가되는 것
    - 내 node project를 실행하려면 `dependencies`에 명시된 package들이 필요하다.
- 실제로 package를 설치하는 방법
  - `package.json`에 `dependencies`로 설치하려는 package와 버전 명시
    ```json
    {
      ...
      "dependencies": {
        "express": "^4.17.1"
      }
    }
    ```
  - `npm install`만 실행하면, `npm`이 `dependencies`를 찾아서 모든 의존성 package를 설치해 준다.
  - Project를 github에 올릴 때 용량이 큰 `node_modules`를 업로드하지 않아도 됨
  - `package.json`, `package-lock.js`, `index.js`만 공유하면 상대방이 프로젝트를 실행할 수 있음`

## Babel

- 최신 javascript를 모든 곳에서 동작하는 stable javascript로 컴파일
  - nodeJS 버전이 오래되었다면 최신 javascript 코드를 실행하지 못할 수도 있음
  - Babel을 사용해서 최신 javascript code를 nodeJS가 이해할 수 있는 javascript 코드로 변환
  - 현재 nodeJS가 특정 javascript code를 이해할 수 있는지 걱정하지 않아도 됨

### Installation

1. **Babel for nodeJS** 설치 : `@babel/core`
   ```shell
   npm install --save-dev @babel/core
   ```
   - `--save-dev` : 해당 package를 `package.json`에 `devDependencies`로 추가함
     - `dependencies` : Project를 위해 필요한 dependency
     - `devDependencies` : 개발자에게 필요한 dependency
   - `--save-dev`를 사용하지 않으면 `dependencies`에 추가됨
   - 이 옵션의 유무에 상관없이 dependency로 추가된 package들은 `node_modules`에 저장됨
   - 옵션을 잘못 사용했더라도 `package.json`에서 dependency 위치만 옮겨주면 됨
2. Preset 설치 : `@babel/perset-env`
   ```shell
   npm i @babel/preset-env --save-dev
   ```
   - preset : babel이 사용하는 거대한 plugin
   - preset-env : 최신 javascript를 사용할 수 있음
3. `babel.config.json` 파일 생성
   - 파일을 찾아서 preset을 설정하게 됨

### Usage

- Javascript에서 babel을 직접 사용하는 방법
  ```javascript
  require("@babel/core").transform("your code", {
    preset: ["@babel/preset-env"],
  });
  ```
- Babel을 직접 사용하는 대신 `package.json`의 `script` 활용
  - `@babel/node` 설치
  - `babel-node` 명령어를 사용할 수 있음
  - `script`에서 `"win": "node index.js"`를 `"dev": "babel-node index.js"`로 변경
    - babel이 적용된 뒤 nodeJS가 실행됨
    - `babel-node` 명령어를 사용하면 nodeJS가 이해하지 못하는 최신 코드를 사용해서 빌드할 수 있음
      ```javascript
      // as-is
      const express = require("express");
      // to-be
      import express from "express";
      ```
    - `npm run dev`로 script 실행
- `nodemon` : babel이 파일이 수정되는 것을 감지하여 재시작해 줌
  - 설치 : `npm i nodemon --save-dev`
  - `babel-node` 명령어와 함께 사용 : `nodemon --exec babel-node index.js`
  - `nodemon`과 함께 run하면 실행 후 console이 종료되지 않고, 파일을 수정한 뒤 저장하면 다시 실행됨
  - 파일을 수정할 때 마다 `npm run dev`를 계속 실행하지 안항도 됨

## Express

- Express 초기화
  ```javascript
  const express = require("express");
  const app = express();
  ```

---

## iOS의 Cocoapods와 비교

- `package.json` == `Podfile`
- `package-lock.json` == `Podfile.lock`
- `npm install` == `pod install`
- `node_modules` == `Pods`
