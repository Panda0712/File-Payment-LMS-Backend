import cloudinary from "cloudinary";
import streamifier from "streamifier";
import fs from "fs";
import os from "os";
import path from "path";
import { env } from "~/config/environment";

const cloudinaryV2 = cloudinary.v2;
cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const streamUpload = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinaryV2.uploader.upload_stream(
      { folder: folderName },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// const streamUploadVideo = (fileBuffer, folderName, options = {}) => {
//   return new Promise((resolve, reject) => {
//     const uploadOptions = {
//       folder: folderName,
//       resource_type: "video",
//       ...options,
//     };

//     const stream = cloudinaryV2.uploader.upload_stream(
//       uploadOptions,
//       (err, result) => {
//         if (err) reject(err);
//         else resolve(result);
//       }
//     );

//     streamifier.createReadStream(fileBuffer).pipe(stream);
//   });
// };

const uploadLargeVideo = (fileBuffer, folderName, options = {}) => {
  return new Promise((resolve, reject) => {
    const tempFilePath = path.join(os.tmpdir(), `video-${Date.now()}.mp4`);

    // Ghi file tạm ra ổ đĩa
    fs.writeFile(tempFilePath, fileBuffer, async (err) => {
      if (err) return reject(err);

      try {
        const result = await cloudinaryV2.uploader.upload_large(tempFilePath, {
          resource_type: "video",
          folder: folderName,
          chunk_size: 6 * 1024 * 1024, // 6MB mỗi chunk, có thể tăng
          ...options,
        });

        fs.unlink(tempFilePath, () => {}); // Xoá file tạm sau upload
        resolve(result);
      } catch (error) {
        fs.unlink(tempFilePath, () => {});
        reject(error);
      }
    });
  });
};

export const CloudinaryProvider = {
  streamUpload,
  streamUploadVideo: uploadLargeVideo,
};
