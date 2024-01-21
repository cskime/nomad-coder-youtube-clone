import express from "express";
import {
  logout,
  edit,
  remove,
  see,
  startGitHubLogin,
  finishGitHubLogin,
} from "../controllers/userController";

const userRouter = express.Router();
userRouter.get("/logout", logout);
userRouter.get("/edit", edit);
userRouter.get("/github/start", startGitHubLogin);
userRouter.get("/github/finish", finishGitHubLogin);
userRouter.get("/:id(\\d+)", see);

export default userRouter;
