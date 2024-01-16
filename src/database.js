import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/wetube");

const database = mongoose.connection;

// on : 여러 번 발생할 수 있는 Event
// on("error", handler) : error가 발생할 때 마다 handler 실행
const handleError = (error) => console.log("DB Error", error);
database.on("error", handleError);

// once : 한 번만 발생하는 Event
// once("open", handler) : connection이 열릴 때 handler가 한 번만 실행됨
const handleOpen = () => console.log("Connected to DB 💾💾");
database.once("open", handleOpen);
