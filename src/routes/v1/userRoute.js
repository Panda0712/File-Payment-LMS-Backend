import express from "express";
import { userController } from "~/controllers/userController";
import { multerUploadMiddleware } from "~/middlewares/multerUploadMiddleware";

const Router = express.Router();

Router.route("/uploads").post(
  multerUploadMiddleware.upload.single("avatar"),
  userController.uploadsAvatar
);

export const userRoute = Router;
