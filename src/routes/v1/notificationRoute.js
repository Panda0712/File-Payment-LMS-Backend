import express from "express";
import { notificationController } from "~/controllers/notificationController";
import { multerUploadMiddleware } from "~/middlewares/multerUploadMiddleware";
import { notificationValidation } from "~/validations/notificationValidation";

const Router = express.Router();

Router.route("/")
  .post(notificationValidation.createNew, notificationController.createNew)
  .get(notificationController.getNotifications);

Router.route("/uploads").post(
  multerUploadMiddleware.upload.single("lms-notifications"),
  notificationController.uploadImages
);

Router.route("/:notificationId")
  .put(
    notificationValidation.updateNotification,
    notificationController.updateNotification
  )
  .delete(
    notificationValidation.deleteNotification,
    notificationController.deleteNotification
  );

export const notificationRoute = Router;
