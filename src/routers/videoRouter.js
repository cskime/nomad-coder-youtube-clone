import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  getUpload,
  postUpload,
} from "../controllers/videoController";

const videoRouter = express.Router();
videoRouter.get("/:id(\\d+)", watch);

/*  [ URL이 같은 GET/POST request의 중복 routing 축약]
    - as-is
        videoRouter.get("/path", getController);
        videoRouter.post("/path", postController);
    - to-be
        videoRouter.route("/path").get(getController).post(postController);
*/
videoRouter.route("/:id(\\d+)/edit").get(getEdit).post(postEdit);
videoRouter.route("/upload").get(getUpload).post(postUpload);
export default videoRouter;
