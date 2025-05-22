import { StatusCodes } from "http-status-codes";
import { CloudinaryProvider } from "~/providers/CloudinaryProvider";
import { notificationService } from "~/services/notificationService";

const createNew = async (req, res, next) => {
  try {
    const createdNotification = await notificationService.createNew(req.body);

    res.status(StatusCodes.CREATED).json(createdNotification);
  } catch (error) {
    next(error);
  }
};

const uploadImages = async (req, res, next) => {
  try {
    const lmsNotificationImage = req.file;

    const uploadImageFile = await CloudinaryProvider.streamUpload(
      lmsNotificationImage.buffer,
      "lms-notifications"
    );

    return res.status(StatusCodes.CREATED).json(uploadImageFile);
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  const { page, itemsPerPage, q } = req.query;
  const queryFilter = q;

  const results = await notificationService.getNotifications(
    page,
    itemsPerPage,
    queryFilter
  );

  res.status(StatusCodes.OK).json(results);
};

const updateNotification = async (req, res, next) => {
  try {
    const notificationId = req.params.notificationId;

    const updatedNotification = await notificationService.updateNotification(
      notificationId,
      req.body
    );

    res.status(StatusCodes.OK).json(updatedNotification);
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notificationId = req.params.notificationId;

    const deletedNotification = await notificationService.deleteNotification(
      notificationId
    );

    res.status(StatusCodes.OK).json(deletedNotification);
  } catch (error) {
    next(error);
  }
};

export const notificationController = {
  createNew,
  getNotifications,
  uploadImages,
  updateNotification,
  deleteNotification,
};
