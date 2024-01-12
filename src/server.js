import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

// 1. Express application 생성
const PORT = 4000;
const app = express();

// 2. Application 설정

const logger = morgan("dev");
app.use(logger);

app.use("/", globalRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

// 3. 설정 완료 후 외부에 개방 (starts listening)
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
