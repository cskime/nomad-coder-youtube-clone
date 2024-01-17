# Summary

강의에서 사용한 API 및 개념 요약 정리

## Node.JS & npm

- node.js : Javascript runtime environment based on V8 engine.
- npm : node.js package manager
- `package.json`
  - `scripts` : custom script executed by `npm` command
  - `dependencies` : External packages to run a node app
  - `devDependencies` : External packages to development
- `node_modules` : Files of installed packages
- Packages
  - Express : Server framework
  - morgan : HTTP request logger middleware for node.js
  - Pug : HTML template language
  - Babel : Transfile latest javascript features to under ES5
    - `@babel/core` : Babel core
    - `@babel/node` : Babel for node.js (It uses a `babel-node` command instead of `node`)
    - `@babel/preset-env` : Transfile latest Javascript features to older one.(under ES5)
  - Nodemon : Monitoring codes and auto restart node app when detect some changes
  - Prettier : Code formatter
- Commands
  - `node {file}.js` : Execute javascript file
  - `npm init` : Initialize node.js application in current directory (creates a `package.json`)
  - `npm run {script}` : Run a script which is wrote in `package.json`
  - `npm i/install {package}` : Install node.js package
  - `npm i {package} --save-dev` : Install node.js pakcage as a `devDependencies`

### Export and Import Javascript

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

## Express

- `express()` : create express app.
- `listen(port, callback?)` : Binds and listens for connections on the specified host and port.
- Middlewares
  - `use(path?, middlewares...)` : Mount middlewares at the specified path.
- Setting
  - `set(name, value)` : Assigns setting name to value.
    - Certain names can be used to configure the behavior of the server.
    - e.g. `view engine`, `views`
  - `get(name)` : Returns the value of name app setting.
  - [More names](https://expressjs.com/en/4x/api.html#app.settings.table)
- Routing
  - `METHOD(path, callbacks...)` : Routes HTTP GET/POST requests to the specified path
  - `route(path)` : Returns an instance of a single route
    - `METHOD(middlewares...?)` : Handle HTTP GET/POST requests to the specified middlewares
  - These methods are also implemented
- Request
  - `request.params` : It's an object containing properties mapped to the named route "parameters".
  - `request.query` : It's an object containing a property for each query string parameter.
  - `request.body` : It contains key-value pairs of data submitted in the request body.
    - default `undefined`
    - It's populated when you use body parsing middleware.
    - e.g. `express.json()`, `express.urlencoded()`
- Response
  - `response.end()` : Ends the response process.
  - `response.send(body)` : Sends the HTTP response with the body parameter
    - a `Buffer` object
    - a `String`
    - an object
    - a `Boolean`
    - an `Array`.
  - `response.render(view, localVariables?, callback?)` : Renders a view and sends the rendered HTML string to the client.
  - `response.redirect(status?, path)` : Redirects to the URL derived from the specified path, status.
- URL encoding
  - `express.urlencoded(options?)` : Parses incoming requests with urlencoded payloads.
    - `extended` option : Allows to choose between parsing the URL-encoded data
      - `{ extended: true }` : Uses the `querystring` library
      - `{ extended: false }` : Uses the `qs` library

### Router

- Router offers a method to make a structured architecture with structured URLs.
- `express.Router()` : creates a new router object ([Router docs](https://expressjs.com/en/4x/api.html#router))
- Some of the express application APIs is also implemented in Router.
  - `METHOD(path, callbacks...)` : Routes HTTP GET/POST requests to the specified path
  - `route(path)` : Returns an instance of a single route
    - `METHOD(middlewares...?)` : Handle HTTP GET/POST requests to the specified middlewares
  - `use(middlewares...)`
  - `use(path, middlewares...)`

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

## Architecture

- Main (server.js) : It's a entry point of node.js app
- Model : Database
- View : HTML or templates
- Controller : Middlewares or handlers to handle request and send a response.
- Router : Route HTTP requests to controller
