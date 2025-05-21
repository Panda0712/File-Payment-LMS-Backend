import { StatusCodes } from "http-status-codes";
import { CloudinaryProvider } from "~/providers/CloudinaryProvider";

const uploadImages = async (req, res, next) => {
  try {
    const courseThumbnail = req.file;

    const uploadImageFile = await CloudinaryProvider.streamUpload(
      courseThumbnail.buffer,
      "course-thumbnails"
    );

    res.status(StatusCodes.CREATED).json(uploadImageFile);
  } catch (error) {
    next(error);
  }
};

const uploadVideos = async (req, res, next) => {
  try {
    const courseVideo = req.files;

    const uploadVideoFile = await Promise.all(
      courseVideo.map((video) =>
        CloudinaryProvider.streamUploadVideo(video.buffer, "course-videos")
      )
    );

    res.status(StatusCodes.CREATED).json(uploadVideoFile);
  } catch (error) {
    next(error);
  }
};

export const courseController = {
  uploadImages,
  uploadVideos,
};
