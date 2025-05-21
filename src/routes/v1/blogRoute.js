import express from "express";
import { blogController } from "~/controllers/blogController";
import { multerUploadMiddleware } from "~/middlewares/multerUploadMiddleware";

const Router = express.Router();

Router.route("/uploads").post(
  multerUploadMiddleware.upload.single("blog-covers"),
  blogController.uploadsBlogCover
);

export const blogRoute = Router;
