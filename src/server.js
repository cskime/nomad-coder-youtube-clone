import express from "express";
import morgan from "morgan";

// 1. Express application 생성
const PORT = 4000;
const app = express();

// 2. Application 설정

// middleware 반환
app.use(morgan("combined"));
app.get("/", (req, res) => {
  return res.end();
});

// 3. 설정 완료 후 외부에 개방 (starts listening)
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
