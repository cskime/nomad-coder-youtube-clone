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

## Express

```js
import express from "express";

/* Create app */
const app = express();

/* Start listening
 * Binds and listens for connections on the specified host and port.
 */
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} 🚀🚀`);
});
```

### App Settings

- Store any value
  ```js
  app.set("title", "My Site");
  app.get("title"); // "My Site"
  ```
- Configure the behavior of the server
  ```js
  app.set("view engine", "pug");
  app.set("views", process.cwd() + "/src/views");
  ```
  - `view engine` : The default engine extension
  - `views` : A directory for the application's views
  - [More properties](https://expressjs.com/en/4x/api.html#app.settings.table)

### Middlewares

- Middleware
  - Functions that have access to the request(`req`), response(`res`) object and the `next()` middleware function
    ```js
    const middleware = (req, res, next) => {
      next(); // execute a next middleware
    };
    ```
  - Execute any code before the cycle ends
  - Make changes to the request and the response objects
  - Call the next middleware in the stack (`next()`)
  - End the request-response cycle
    ```js
    // The last middleware doesn't need a next() middleware function
    const middleware = (req, res) => {
      res.end(); // end cycle
    };
    ```
- Mounts the specified middlewares at the specified path
- Application-level middleware
  ```js
  const app = express();
  app.use("/users", middleware1, middleware2, middleware3);
  app.use(middleware); // default route to root path (`/`)
  ```
- Router-level middleware
  ```js
  const router = express.Router();
  router.use("/users", middleware1, middleware2, middleware3);
  router.use(middleware);
  ```
- Built-in middlewares
  - `express.urlencoded(options)` : Parses incoming requests with urlencoded payloads(the data in the body)
    ```js
    app.use(express.urlencoded({ extended: true }));
    ```
    - `extended` option : Allows to choose between a parsing URL-encoded data libraries
      - `{ extended: true }` : Uses the `querystring` library
      - `{ extended: false }` : Uses the `qs` library
    - Use this when you

### Router

- An isolated instance of middleware and routes
- It's a "mini-application", capable only of performing middleware and routing functions.
  ```js
  const userRouter = express.Router();
  const editController = (req, res) => res.send("Edit User Profile");
  userRouter.get("/edit", someMiddleware, editController);
  app.use("/users", userRouter);
  ```

### Request

- `req.params` : It's an object containing properties mapped to the **named route parameters**
  ```js
  // Request URL: http://localhost:4000/users/34/books/8989
  app.get("/users/:userId/books/:bookId", (req, res) => {
    req.send(req.params); // { "userId": "34", "bookId": "8989" }
  });
  ```
- `req.query` : It's an object containing a property for each **query string parameter** in the route
  ```js
  // Request URL: http://localhost:4000/users?userId=34&bookId=8989
  app.get("/users/:userId/books/:bookId", (req, res) => {
    req.send(req.query); // { "userId": "34", "bookId": "8989" }
  });
  ```
- `req.body` : It contains key-value pairs of data submitted in the **request body**
  ```js
  app.use(express.json()); // for parsing application/json
  app.post("/profile", (req, res, next) => {
    res.json(req.body); // { "name": "Chamsol Kim", "email": "kcsol1005@gmail.com" }
  });
  ```
  - It's populated when you use body parsing middleware.
    - `express.json()` : for parsing `application/json`
    - `express.urlencoded()` : for parsing `application/x-ww-form-urlencoded`

### Response

- `res.end()` : Ends the response process.
  ```js
  res.end();
  ```
- `res.send(body)` : Sends the HTTP response
  ```js
  res.send(Buffer.from("whoop")); // Send a Buffer object
  res.send({ some: "json" }); // Send an object
  res.send("<p>some html</p>"); // Send a String
  res.send([1, 2, 3]); // Send an array
  ```
- `res.render(view, locals?, callback?)` : Renders a view and sends the rendered HTML string to the client.
  ```js
  res.render("index");
  res.render(
    "index",
    { name: "Kim" }, // The `index` view can uses `name` vairable inside
    (error, html) => res.send(html)
  );
  await res.render("index", { name: "Kim" }); // Use a Promise instead of callback function
  ```
- `res.redirect(status?, path)` : Redirects to the URL derived from the specified path, status.
  ```js
  res.redirect("post/new"); // Redirects to relative path
  res.redirect("/admin"); // Redirects to absolute path
  res.redirect("https://example.com"); // Redirects to a fully-qualified URL
  res.redirect(301, "https://example.com"); // Redirects with status code
  ```
- `res.status(code)` : Sets the HTTP status for the response
  ```js
  res.status(400).end(); // chainable
  ```

## Pug

HTML template language

- Usage
  - Pug can be fully integrated to Express.
  - Set Pug as a view rendering engine.
    ```javascript
    const app = express();
    app.set("view engine", "pug");
    ```
  - Then, a response can render the `.pug` file.
    ```javascript
    app.get("/some/path", (req, res) => res.render("myView"));
    ```
  - Express looks up view files at the path that is set as `views` setting.
    ```javascript
    app.set("views", process.cwd() + "/src/views");
    ```
- Partial
  - Pug codes can be separated to another files, and it can be inserted to specified location.
  - `include` : Insert another `.pug` file's code. (`include partials/footer`)
  - `mixin` : Reuse a code block with some arguments
    - definition : `mixin name(params...)`
    - usage : `+name("A", "B")`
- Inheritance
  - `extends` : Create `.pug` file based on another `.pug` file
  - `block`
    - In a parent file, `block name` indicates the location which is injected from child file.
    - In a child file, `block name` indicates the content which is going to inject to parent file.
- Interpolation
  - `#{value}` : Interpolates a value into HTML
  - `=value` : Puts a value to a HTML element directly
- Conditional
  - `if-else`
- Iteration
  - `each value in values ... else`
    - Iterate `values` as a `value`.
    - If `values` are empty, execute `else` block.

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
