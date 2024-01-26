- Babel

  - `@babel/core` : Babel 기능 모음
  - `@babel/preset-env`, `babel.config.json` : babel이 최신 js 코드를 변환할 수 있게 함
  - `@babel/node` : babel을 nodeJS에서 사용할 수 있게 함
  - `@babel/nodemon` : 파일이 변경될 때 마다 restart

- Javascript에서 babel을 직접 사용하는 방법
  ```javascript
  require("@babel/core").transform("your code", {
    preset: ["@babel/preset-env"],
  });
  ```
- Babel을 직접 사용하는 대신 `package.json`의 `script` 활용
  - `@babel/node` 설치
  - `babel-node` 명령어를 사용할 수 있음
    - js 파일이 babel에 의해 컴파일될 수 있도록 `babel-node` 명령어로 실행
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

## Babel

- 최신 javascript를 모든 곳에서 동작하는 stable javascript로 컴파일
- nodeJS 버전이 오래되었다면 최신 javascript 코드를 실행하지 못할 수도 있음
- Babel을 사용해서 최신 javascript code를 nodeJS가 이해할 수 있는 javascript 코드로 변환
  - ES6+ 문법을 지원하지 않는 환경에서는 호환되는 ES5 이하 문법으로 변환해줌
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
2. Preset 설치 : `@babel/preset-env`
   ```shell
   npm i @babel/preset-env --save-dev
   ```
   - preset : babel이 사용하는 거대한 plugin
   - preset-env : 최신 javascript를 사용할 수 있음
3. `babel.config.json` 파일 생성
   - `babel-node` 명령어를 사용하기 위해 필요한 설정 파일
   - 필요한 plugin 설치
     - `preset-env` : 최신 javascript를 사용하게 해 주는 plugin

## Babel

- 최신 javascript를 모든 곳에서 동작하는 stable javascript로 컴파일
- nodeJS 버전이 오래되었다면 최신 javascript 코드를 실행하지 못할 수도 있음
- Babel을 사용해서 최신 javascript code를 nodeJS가 이해할 수 있는 javascript 코드로 변환
  - ES6+ 문법을 지원하지 않는 환경에서는 호환되는 ES5 이하 문법으로 변환해줌
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
2. Preset 설치 : `@babel/preset-env`
   ```shell
   npm i @babel/preset-env --save-dev
   ```
   - preset : babel이 사용하는 거대한 plugin
   - preset-env : 최신 javascript를 사용할 수 있음
3. `babel.config.json` 파일 생성
   - `babel-node` 명령어를 사용하기 위해 필요한 설정 파일
   - 필요한 plugin 설치
     - `preset-env` : 최신 javascript를 사용하게 해 주는 plugin

## Babel

- 최신 javascript를 모든 곳에서 동작하는 stable javascript로 컴파일
- nodeJS 버전이 오래되었다면 최신 javascript 코드를 실행하지 못할 수도 있음
- Babel을 사용해서 최신 javascript code를 nodeJS가 이해할 수 있는 javascript 코드로 변환
  - ES6+ 문법을 지원하지 않는 환경에서는 호환되는 ES5 이하 문법으로 변환해줌
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
2. Preset 설치 : `@babel/preset-env`
   ```shell
   npm i @babel/preset-env --save-dev
   ```
   - preset : babel이 사용하는 거대한 plugin
   - preset-env : 최신 javascript를 사용할 수 있음
3. `babel.config.json` 파일 생성
   - `babel-node` 명령어를 사용하기 위해 필요한 설정 파일
   - 필요한 plugin 설치
     - `preset-env` : 최신 javascript를 사용하게 해 주는 plugin
