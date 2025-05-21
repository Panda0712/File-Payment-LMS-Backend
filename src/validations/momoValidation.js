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
  console.log(req.body);
  const correctCondition = Joi.object({
    partnerCode: Joi.string().required(),
    orderId: Joi.string().required(),
    requestId: Joi.string().required(),
    amount: Joi.number().required(),
    orderInfo: Joi.string().required(),
    orderType: Joi.string().required(),
    transId: Joi.number().required(),
    resultCode: Joi.number().required(),
    message: Joi.string().required(),
    payType: Joi.string().required(),
    responseTime: Joi.number().required(),
    extraData: Joi.string().required(),
    signature: Joi.string().required(),
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

const checkTransactionStatus = async (req, res, next) => {
  const correctCondition = Joi.object({
    orderId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
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

export const momoValidation = {
  createPayment,
  callbackPayment,
  checkTransactionStatus,
};
