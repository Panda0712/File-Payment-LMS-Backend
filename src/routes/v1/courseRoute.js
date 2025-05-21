import express from "express";
import { courseController } from "~/controllers/courseController";
import { multerUploadMiddleware } from "~/middlewares/multerUploadMiddleware";

const Router = express.Router();

Router.route("/uploads").post(
  multerUploadMiddleware.upload.single("course-thumbnails"),
  courseController.uploadImages
);

Router.route("/uploads-videos").post(
  multerUploadMiddleware.uploadVideo.array("course-videos", 5),
  courseController.uploadVideos
);

export const courseRoute = Router;
