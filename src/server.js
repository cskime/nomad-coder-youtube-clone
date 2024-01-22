import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";
// import { connection } from "mongoose";

const app = express();

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

const logger = morgan("dev");
app.use(logger);

const parser = express.urlencoded({ extended: true });
app.use(parser);

const sessionMiddleware = session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    // 이미 mongoose가 MongoDB와 연결되어 있으므로
    // mongoose의 client를 사용해서 만들 수도 있다.
    // client: connection.client
    mongoUrl: process.env.DB_URL,
  }),
  // cookie: {
  //   maxAge: 20000,
  // },
});
app.use(sessionMiddleware);

app.use(localsMiddleware);

/* Static files serving */
app.use("/uploads", express.static("uploads"));
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;
