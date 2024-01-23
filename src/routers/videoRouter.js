import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  getUpload,
  postUpload,
  deleteVideo,
} from "../controllers/videoController";
import { protectorMiddleware, uploadVideo } from "../middlewares";

const videoRouter = express.Router();

/* [ Regular Expression ]
  - id를 number로 사용할 때는 `\\d+` regex를 사용할 수 있었음
  - MongoDB로 model을 생성할 때 부여되는 id는 string이므로, 이 regex를 사용할 수 없다.
  - MongoDB가 만들어 주는 object id는 24byte hex string이므로, 이 형식에 맞게 regex 수정
    - [0-9a-f]{24}
    - [0-9a-f] : hex string이므로 0~9, a~까지 사용
    - {24} : 단위가 byte이므로, 문자 24개(1개 1byte)까지 검색
*/
videoRouter.get("/:id([0-9a-f]{24})", watch);

/* [ URL이 같은 GET/POST request의 중복 routing 축약]
  - as-is:
    videoRouter.get("/path", getController);
    videoRouter.post("/path", postController);
  - to-be:
    videoRouter.route("/path").get(getController).post(postController);
*/
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(deleteVideo);

/* [ Route 순서 ]
  - Regex를 사용하지 않을 경우, `:id` parameter를 사용하는 route가 위에 있다면 `upload`도 regex에 매칭됨
  - 따라서, video upload page로 가지 못하고 항상 watch page로 이동하게 됨
  - URL parameter가 없는 routing code를 가장 위로 옮겨도 해결되지만, 안전하지 않으므로 regex를 사용하는 방법 권장
 */
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(uploadVideo.single("video"), postUpload);
export default videoRouter;
