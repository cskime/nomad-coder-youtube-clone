# Babel

- Javascript 버전 호환성을 맞추기 위한 package
- 최신 javascript를 모든 곳에서 동작하는 stable javascript로 컴파일
- Node.js 버전이 오래되었다면 최신 javascript 코드를 실행하지 못할 수도 있음
- Babel을 사용하면 최신 문법으로 작성한 Javascript code를 Node.js가 이해할 수 있는 구버전 code로 변환해줌
  - ES6+ 문법을 지원하지 않는 환경에서는 호환되는 ES5 이하 문법으로 변환해줌
  - 현재 nodeJS가 특정 javascript code를 이해할 수 있는지 걱정하지 않아도 된다.
- Plugins
  - `@babel/core` : Babel 기능 모음
  - `@babel/preset-env`, `babel.config.json` : babel이 최신 js 코드를 변환할 수 있게 함
  - `@babel/node` : babel을 node.js에서 사용할 수 있게 함
  - `@babel/nodemon` : 파일이 변경될 때 마다 restart

## 설치

1. Babel for node.js 설치 (`@babel/core`)
   - `npm install --save-dev @babel/core`
2. Preset 설치 (`@babel/preset-env`)
   - `npm i @babel/preset-env --save-dev`
   - preset : babel이 사용하는 거대한 plugin
   - `@babel/preset-env` : 최신 Javascript를 변환해 주는 plugin
3. `babel.config.json` 파일 생성
   - `preset-env` : 최신 javascript를 사용하게 해 주는 plugin

## 사용

- Javascript에서 babel을 직접 사용하는 방법
  ```javascript
  require("@babel/core").transform("your code", {
    preset: ["@babel/preset-env"],
  });
  ```
- Babel을 직접 사용하는 대신 `package.json`의 `script` 활용
  - `@babel/node` 설치하면 `babel-node` 명령어를 사용할 수 있음
  - Javascript 파일을 babel로 컴파일한 뒤 `node`로 실행시킴
  - Javascript 파일을 실행하는 명령어를 `node` -> `babel-node`로 변경
    - `script`에서 `"win": "node index.js"`를 `"dev": "babel-node index.js"`로 변경
    - `babel-node` 명령어를 사용하면 nodeJS가 이해하지 못하는 최신 코드를 사용해서 빌드할 수 있음
      ```javascript
      // as-is
      const express = require("express");
      // to-be
      import express from "express";
      ```
