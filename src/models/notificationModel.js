import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "~/config/mongodb";
import { pagingSkipValue } from "~/utils/algorithms";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";

const NOTIFICATION_COLLECTION_NAME = "notifications";
const NOTIFICATION_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().trim().strict(),
  images: Joi.string().required(),
  message: Joi.string().required().min(10).max(150).trim().strict(),

  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});

const INVALID_UPDATE_FIELDS = ["_id"];

const validateBeforeCreate = async (data) => {
  return await NOTIFICATION_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const createNew = async (reqData) => {
  try {
    const validData = await validateBeforeCreate(reqData);

    const createdNotification = await GET_DB()
      .collection(NOTIFICATION_COLLECTION_NAME)
      .insertOne(validData);

    return createdNotification;
  } catch (error) {
    throw new Error(error);
  }
};

const getNotifications = async (page, itemsPerPage, queryFilter) => {
  try {
    const queryConditions = [
      {
        _destroy: false,
      },
    ];

    if (queryFilter) {
      Object.keys(queryFilter).forEach((key) => {
        queryConditions.push({
          [key]: { $regex: RegExp(queryFilter[key], "i") },
        });
      });
    }

    const query = await GET_DB()
      .collection(NOTIFICATION_COLLECTION_NAME)
      .aggregate(
        [
          { $match: { $and: queryConditions } },
          { $sort: { name: 1 } },
          {
            $facet: {
              queryNotifications: [
                { $skip: pagingSkipValue(page, itemsPerPage) },
                { $limit: itemsPerPage },
              ],
              queryTotalNotifications: [{ $count: "countedAllNotifications" }],
            },
          },
        ],
        {
          collation: { locale: "en" },
        }
      )
      .toArray();

    const res = query[0];

    return {
      notifications: res.queryNotifications || [],
      totalNotifications:
        res.queryTotalNotifications[0]?.countedAllNotifications || 0,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (id) => {
  try {
    const foundNotification = await GET_DB()
      .collection(NOTIFICATION_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(id)),
      });

    return foundNotification;
  } catch (error) {
    throw new Error(error);
  }
};

const updateNotification = async (notificationId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName];
      }
    });

    const result = await GET_DB()
      .collection(NOTIFICATION_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(String(notificationId)),
        },
        {
          $set: updateData,
        },
        {
          returnDocument: "after",
        }
      );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteNotification = async (notificationId) => {
  try {
    const deletedNotification = await GET_DB()
      .collection(NOTIFICATION_COLLECTION_NAME)
      .deleteOne({
        _id: new ObjectId(String(notificationId)),
      });

    return deletedNotification;
  } catch (error) {
    throw new Error(error);
  }
};

export const notificationModel = {
  NOTIFICATION_COLLECTION_NAME,
  NOTIFICATION_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getNotifications,
  updateNotification,
  deleteNotification,
};
