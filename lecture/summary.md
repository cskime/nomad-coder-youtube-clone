# Summary

## Table of Contents

1. node.js & npm
2. Express
3. Pug
   - HTML template
   - Input value
   - Use global variable (`res.locals`)
4. MongoDB
   - NoSQL database
5. Mongoose
   - Integrates MongoDB into nodeJS app
6. Login/Logout
   - session, cookie, token
   - express-session
   - Login
   - Logout
7. OAuth login (Social login)
   - GitHub login
   - Connect GitHub account with existing account
8. File
   - `multer`
   - Static files serving
9. Appendix A. Import & Export Javascript Module
   - Javascript file is a isolated module.
   - To use js code from another file, the code has to be exported.
   - Export codes
     - `export` : Export each variables and functions.
     - `export default` : Export only one variable or function.
   - Import codes
     - `import name from "path"` : Import the default exporting code from a file
     - `import { a, b, c } from "path"` : Import multiple exporting codes from a file
     - `import package from "package"` : Import from package
     - When it imports a file which has a default exporting code, the name can be whatever.
     - If importing file has a multiple exporting codes, the name has to the same.
10. Appendix B. Some javascript features

## node.js & npm

- node.js : Javascript runtime environment based on V8 engine.
- npm : node.js package manager
- `package.json`
  - `scripts` : custom script executed by `npm` command
  - `dependencies` : dependencies which are installed via `npm i package`
    - `express` : Server framework
    - `morgan` : HTTP request logger middleware for node.js
    - `pug` : HTML template
    - `bcrypt` : Password Encryption
    - `mongoose` : MongoDB for node.js
    - `express-session` : Session in express
    - `connect-mongo` : Persistence for express-session
    - `dotenv` : add keys in `.env` to environment (`process.env`)
  - `devDependencies` : dependencies which are installed via `npm i package --save-dev`
    - `babel` : Transfile latest javascript features to under ES5
      - `@babel/core` : Babel core
      - `@babel/node` : Babel for node.js (It uses a `babel-node` command instead of `node`)
      - `@babel/preset-env` : Transfile latest Javascript features to older one.(under ES5)
    - `nodemon` : Monitoring codes and auto restart node app when detect some changes
  ```

  ```

## MongoDB & Mongoose

- MongoDB
  - `mongosh`
  - `show dbs`
  - `use {db}`
  - `show collections`
  - `db.{collection}.find()`
- Mongoose
  - `connect(databaseURI)`
  - `connection`
  - Database
    - `on(event, handler)`
    - `once(event, handler)`
  - Model
    - `new Schema({})`
      - `static(functionName, function object)`
    - `model("name", schema)`
    - `new Model({})`
    - `await Model.create({})`
    - `await model.save()`
    - `await Model.find({})`
    - `await Model.findOne({})`
    - `await Model.findById({})`
    - `await Model.findByIdAndUpdate({})`
    - `await Model.exist({})`

## Architecture

- Main (server.js) : It's a entry point of node.js app
- Model : Database
- View : HTML or templates
- Controller : Middlewares or handlers to handle request and send a response.
- Router : Route HTTP requests to controller

## Appendix. Route(Path) Parameter vs Query Parameter

- Route Parameter
  - 특정 자원에 접근하는 URL에 가변 요소를 만드는 방법
  - 유일한 값을 식별하는 용도
- Query Parameter
  - 같은 URL에 대해 조건을 주는 방법
  - 데이터를 선택적으로 처리하기 위한 옵션
- [참고](https://velog.io/@juno97/API-Path-parameter-VS-Query-Parameter-%EA%B8%B0%EB%A1%9D%EC%9A%A9)
