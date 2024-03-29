# Nodemon

- 파일이 변경될 때 node.js app을 재시작
- Console에서 일일이 종료 후 재실행 하지 않아도 됨
- `nodemon --exec {SCRIPT}`
  ```json
  {
    ...,
    "scripts": {
        "dev": "nodemon --exec babel-node src/init.js", // 직접 실행
        // or
        "dev": "nodemon", // Configuration file을 통해서 실행
    },
  }
  ```
- `nodemon.json` : `nodemon` 명령어를 실행할 때 default로 사용하는 configuration file
  ```json
  {
    "ignore": ["webpack.config.js", "src/client/*", "assets/*"],
    "exec": "babel-node src/init.js"
  }
  ```
  - `ignore` : Nodemon이 감시하지 않을 file 목록 설정. 이 file들을 저장해도 nodemon이 동작하지 않음
    - `webpack.config.js` : Webpack 파일은 node.js app과 독립적으로 관리됨
    - `src/client/*` : Client를 위한 file들은 수정해도 server app과 무관
    - `assets/*` : Webpack에 의해 생성된 static file들은 server app과 무관
  - `exec` : `nodemon` 명령어가 실행할 script
