import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "~/config/mongodb";
import { BOOKING_STATUS, PAYMENT_METHODS } from "~/utils/constants";
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE,
} from "~/utils/validators";

const ORDER_COLLECTION_NAME = "orders";
const ORDER_COLLECTION_SCHEMA = Joi.object({
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
    .valid(PAYMENT_METHODS.CASH, PAYMENT_METHODS.MOMO, PAYMENT_METHODS.ZALOPAY),
  totalPrice: Joi.number().required(),
  status: Joi.string()
    .required()
    .valid(
      BOOKING_STATUS.CANCELLED,
      BOOKING_STATUS.PENDING,
      BOOKING_STATUS.COMPLETED
    ),

  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});

const INVALID_UPDATE_FIELDS = [
  "_id",
  "createdAt",
  "userId",
  "userEmail",
  "userName",
  "courseId",
];

const validateBeforeCreate = async (data) => {
  return await ORDER_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const createNew = async (reqData) => {
  try {
    const items = Array.isArray(reqData) ? reqData : [reqData];

    const validatedItems = await Promise.all(
      items.map((item) => validateBeforeCreate(item))
    );

    const ordersToInsert = validatedItems.map((item) => ({
      ...item,
      userId: new ObjectId(String(item.userId)),
      courseId: new ObjectId(String(item.courseId)),
    }));

    const result = await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .insertMany(ordersToInsert);

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const orderModel = {
  ORDER_COLLECTION_NAME,
  ORDER_COLLECTION_SCHEMA,
  createNew,
};
