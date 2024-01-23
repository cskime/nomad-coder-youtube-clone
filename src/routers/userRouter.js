import express from "express";
import {
  logout,
  getEdit,
  postEdit,
  see,
  startGitHubLogin,
  finishGitHubLogin,
  getChangePassword,
  postChangePassword,
} from "../controllers/userController";
import {
  protectorMiddleware,
  publicOnlyMiddleware,
  uploadAvatar,
} from "../middlewares";

const userRouter = express.Router();
userRouter.get("/logout", protectorMiddleware, logout);
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)

  /* [ Multer로 생성한 middleware 사용 ]
   * - `single(fieldName)` : upload할 file 개수
   *   - POST request로 image file이 전송될 것
   *   - 이 때 file이 전송되는 field name 사용 (<input>의 name attribute)
   *
   * [ Multer 동작 방식 ]
   * 1. Middleware 생성 시 upload된 file의 저장 위치 설정
   * 2. POST request로 받은 body에서 file에 해당하는 field 지정.
   *    - upload되는 file 개수 지정
   * 3. Multer middleware는 upload된 file을 처리한 뒤 controller(`postEdit`)로 file 전달
   *    - Middleware가 file을 request에 추가해 줌 (`req.file`)
   */
  .post(uploadAvatar.single("avatar"), postEdit);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGitHubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGitHubLogin);
userRouter.get("/:id([0-9a-f]{24})", see);

export default userRouter;
