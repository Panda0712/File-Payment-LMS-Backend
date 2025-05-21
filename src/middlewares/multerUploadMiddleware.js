import { StatusCodes } from "http-status-codes";
import multer from "multer";
import ApiError from "~/utils/ApiError";
import {
  ALLOW_COMMON_FILE_TYPES,
  LIMIT_COMMON_FILE_SIZE,
  ALLOW_VIDEO_FILE_TYPES,
  LIMIT_VIDEO_FILE_SIZE,
} from "~/utils/validators";

const customFileFilter = (req, file, callback) => {
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage =
      "Định dạng không được hỗ trợ. Chỉ chấp nhận jpg, jpeg và png";

    return callback(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage),
      null
    );
  }

  return callback(null, true);
};

const customVideoFileFilter = (req, file, callback) => {
  if (!ALLOW_VIDEO_FILE_TYPES.includes(file.mimetype)) {
    const errMessage =
      "Định dạng video không được hỗ trợ. Chỉ chấp nhận mp4, webm, ogg, avi, mov, wmv, quicktime";
    return callback(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage),
      null
    );
  }
  return callback(null, true);
};

const uploadVideo = multer({
  limits: { fileSize: LIMIT_VIDEO_FILE_SIZE },
  fileFilter: customVideoFileFilter,
});

const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter,
});

export const multerUploadMiddleware = {
  upload,
  uploadVideo,
};
