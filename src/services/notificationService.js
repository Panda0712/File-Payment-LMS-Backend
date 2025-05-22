import { StatusCodes } from "http-status-codes";
import { notificationModel } from "~/models/notificationModel";
import ApiError from "~/utils/ApiError";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "~/utils/constants";

const createNew = async (reqData) => {
  try {
    const createdNotification = await notificationModel.createNew(reqData);

    const getNewNotification = await notificationModel.findOneById(
      createdNotification.insertedId
    );

    return getNewNotification;
  } catch (error) {
    throw error;
  }
};

const getNotifications = async (page, itemsPerPage, queryFilter) => {
  try {
    if (!page) page = DEFAULT_PAGE;
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE;

    const results = await notificationModel.getNotifications(
      parseInt(page, 10),
      parseInt(itemsPerPage, 10),
      queryFilter
    );

    return results;
  } catch (error) {
    throw error;
  }
};

const updateNotification = async (notificationId, reqData) => {
  try {
    const updatedNotification = await notificationModel.updateNotification(
      notificationId,
      reqData
    );

    return updatedNotification;
  } catch (error) {
    throw error;
  }
};

const deleteNotification = async (notificationId) => {
  try {
    const deletedNotification = await notificationModel.deleteNotification(
      notificationId
    );

    return deletedNotification;
  } catch (error) {
    throw error;
  }
};

export const notificationService = {
  createNew,
  getNotifications,
  updateNotification,
  deleteNotification,
};
