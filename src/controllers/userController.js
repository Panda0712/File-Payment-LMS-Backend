import { StatusCodes } from "http-status-codes";
import { CloudinaryProvider } from "~/providers/CloudinaryProvider";

const uploadsAvatar = async (req, res, next) => {
  try {
    const avatarImage = req.file;

    const uploadImageFile = await CloudinaryProvider.streamUpload(
      avatarImage.buffer,
      "avatar"
    );

    res.status(StatusCodes.CREATED).json(uploadImageFile);
  } catch (error) {
    next(error);
  }
};

export const userController = {
  uploadsAvatar,
};
