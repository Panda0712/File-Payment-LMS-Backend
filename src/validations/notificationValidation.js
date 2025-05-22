import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import ApiError from "~/utils/ApiError";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().trim().strict(),
    images: Joi.string().required(),
    message: Joi.string().required().min(10).max(150).trim().strict(),
  });

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    );
  }
};

const updateNotification = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().trim().strict(),
    images: Joi.string(),
    message: Joi.string().min(10).max(150).trim().strict(),
  });
  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    next();
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    );
  }
};

const deleteNotification = async (req, res, next) => {
  const correctCondition = Joi.object({
    notificationId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
  });

  try {
    await correctCondition.validateAsync(req.params, { abortEarly: false });
    next();
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    );
  }
};

export const notificationValidation = {
  createNew,
  updateNotification,
  deleteNotification,
};
