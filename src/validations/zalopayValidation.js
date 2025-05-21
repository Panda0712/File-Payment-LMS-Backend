import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import ApiError from "~/utils/ApiError";
import { PAYMENT_METHODS } from "~/utils/constants";
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE,
} from "~/utils/validators";

const createPayment = async (req, res, next) => {
  const singleItemSchema = Joi.object({
    userId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    userName: Joi.string().required().min(5).trim().strict(),
    userEmail: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .message(EMAIL_RULE_MESSAGE),
    courseId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    courseName: Joi.string().required().min(10).trim().strict(),
    courseThumbnail: Joi.string().required().min(10).trim().strict(),
    instructor: Joi.string().required().min(10).trim().strict(),
    paymentMethod: Joi.string()
      .required()
      .valid(
        PAYMENT_METHODS.CASH,
        PAYMENT_METHODS.MOMO,
        PAYMENT_METHODS.ZALOPAY
      ),
    totalPrice: Joi.number().required(),
  });

  const correctCondition = Joi.alternatives().try(
    singleItemSchema,
    Joi.array().items(singleItemSchema).min(1)
  );

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    );
  }
};

const callbackPayment = async (req, res, next) => {
  const correctCondition = Joi.object({
    data: Joi.string().required(),
    mac: Joi.string().required(),
    type: Joi.number().optional(),
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

export const zalopayValidation = { createPayment, callbackPayment };
