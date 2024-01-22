import express from "express";
import {
  logout,
  getEdit,
  postEdit,
  see,
  startGitHubLogin,
  finishGitHubLogin,
} from "../controllers/userController";
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares";

/* */

const userRouter = express.Router();
userRouter.get("/logout", protectorMiddleware, logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
userRouter.get("/github/start", publicOnlyMiddleware, startGitHubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGitHubLogin);
userRouter.get("/:id(\\d+)", see);

export default userRouter;
