import { StatusCodes } from "http-status-codes";
import { CloudinaryProvider } from "~/providers/CloudinaryProvider";

const uploadsBlogCover = async (req, res, next) => {
  try {
    const blogCoverImage = req.file;

    const uploadImageFile = await CloudinaryProvider.streamUpload(
      blogCoverImage.buffer,
      "blog-covers"
    );

    res.status(StatusCodes.CREATED).json(uploadImageFile);
  } catch (error) {
    next(error);
  }
};

export const blogController = {
  uploadsBlogCover,
};
