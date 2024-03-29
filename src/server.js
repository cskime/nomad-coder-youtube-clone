import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware } from "./middlewares";
// import { connection } from "mongoose";

const app = express();

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

const logger = morgan("dev");
app.use(logger);

// URL encoded body payload를 받도록 설정
app.use(express.urlencoded({ extended: true }));

// JSON body payload를 받도록 설정
app.use(express.json());

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

app.use(flash());
app.use(localsMiddleware);

/* Static files serving */
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets")); // Client에서 webpack 변환 file에 접근할 수 있도록 설정

app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;
