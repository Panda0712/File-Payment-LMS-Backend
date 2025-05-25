// import cloudinary from "cloudinary";
// import streamifier from "streamifier";
// import { env } from "~/config/environment";

// const cloudinaryV2 = cloudinary.v2;
// cloudinaryV2.config({
//   cloud_name: env.CLOUDINARY_CLOUD_NAME,
//   api_key: env.CLOUDINARY_API_KEY,
//   api_secret: env.CLOUDINARY_API_SECRET,
// });

// const streamUpload = (fileBuffer, folderName) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinaryV2.uploader.upload_stream(
//       { folder: folderName },
//       (err, result) => {
//         if (err) reject(err);
//         else resolve(result);
//       }
//     );

//     streamifier.createReadStream(fileBuffer).pipe(stream);
//   });
// };

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

// export const CloudinaryProvider = {
//   streamUpload,
//   streamUploadVideo,
// };
import cloudinary from "cloudinary";
import streamifier from "streamifier";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { env } from "~/config/environment";

const cloudinaryV2 = cloudinary.v2;
cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Tạo thư mục temp nếu chưa tồn tại
const ensureTempDir = () => {
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
};

// Hàm nén video với nhiều mức độ
const compressVideo = (inputPath, outputPath, compressionLevel = "medium") => {
  return new Promise((resolve, reject) => {
    let ffmpegCommand = ffmpeg(inputPath);

    switch (compressionLevel) {
      case "light":
        ffmpegCommand = ffmpegCommand
          .videoCodec("libx264")
          .audioCodec("aac")
          .videoBitrate("2000k")
          .audioBitrate("128k")
          .size("?x1080")
          .format("mp4");
        break;

      case "medium":
        ffmpegCommand = ffmpegCommand
          .videoCodec("libx264")
          .audioCodec("aac")
          .videoBitrate("1200k")
          .audioBitrate("96k")
          .size("?x720")
          .format("mp4")
          .addOptions(["-crf 28"]); // Constant Rate Factor for better compression
        break;

      case "heavy":
        ffmpegCommand = ffmpegCommand
          .videoCodec("libx264")
          .audioCodec("aac")
          .videoBitrate("800k")
          .audioBitrate("64k")
          .size("?x480")
          .format("mp4")
          .addOptions(["-crf 32", "-preset fast"]);
        break;

      case "extreme":
        ffmpegCommand = ffmpegCommand
          .videoCodec("libx264")
          .audioCodec("aac")
          .videoBitrate("500k")
          .audioBitrate("48k")
          .size("?x360")
          .format("mp4")
          .addOptions(["-crf 35", "-preset ultrafast"]);
        break;
    }

    ffmpegCommand
      .on("start", (commandLine) => {
        console.log("FFmpeg compression started:", commandLine);
      })
      .on("progress", (progress) => {
        console.log(
          `Compression progress: ${Math.round(progress.percent || 0)}%`
        );
      })
      .on("end", () => {
        console.log("Video compression completed");
        resolve();
      })
      .on("error", (err) => {
        console.error("FFmpeg compression error:", err);
        reject(err);
      })
      .save(outputPath);
  });
};

// Hàm upload ảnh thông thường
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

// Hàm upload video với chunked upload
const streamUploadVideo = (fileBuffer, folderName, options = {}) => {
  return new Promise((resolve, reject) => {
    const fileSizeMB = fileBuffer.length / (1024 * 1024);

    console.log(`Video upload - File size: ${fileSizeMB.toFixed(2)}MB`);

    const baseOptions = {
      folder: folderName,
      resource_type: "video",
      timeout: 600000, // 10 phút timeout
      video_codec: "auto",
      quality: "auto:good",
      format: "mp4",
      ...options,
    };

    // Sử dụng chunked upload cho file lớn
    if (fileSizeMB > 25) {
      console.log("Using chunked upload...");
      return uploadVideoChunked(fileBuffer, baseOptions, resolve, reject);
    }

    // Upload bình thường
    const stream = cloudinaryV2.uploader.upload_stream(
      baseOptions,
      (err, result) => {
        if (err) {
          console.error("Cloudinary video upload error:", err);
          reject(err);
        } else {
          console.log("Video upload successful:", result.public_id);
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Hàm upload chunked
const uploadVideoChunked = (fileBuffer, options, resolve, reject) => {
  const chunkOptions = {
    ...options,
    chunk_size: 6000000, // 6MB chunks
  };

  try {
    const uploadStream = cloudinaryV2.uploader.upload_chunked_stream(
      chunkOptions,
      (error, result) => {
        if (error) {
          console.error("Chunked video upload error:", error);
          reject(error);
        } else {
          console.log("Chunked video upload successful:", result.public_id);
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  } catch (error) {
    console.error("Error setting up chunked upload:", error);
    reject(error);
  }
};

// Hàm upload với compression cho video rất lớn
const uploadLargeVideo = async (fileBuffer, folderName, options = {}) => {
  const tempDir = ensureTempDir();
  const timestamp = Date.now();
  const inputPath = path.join(tempDir, `input_${timestamp}.mp4`);
  const outputPath = path.join(tempDir, `output_${timestamp}.mp4`);

  try {
    const originalSizeMB = fileBuffer.length / (1024 * 1024);
    console.log(`Processing large video: ${originalSizeMB.toFixed(2)}MB`);

    // Lưu buffer thành file tạm
    fs.writeFileSync(inputPath, fileBuffer);

    // Xác định mức độ nén dựa trên kích thước
    let compressionLevel = "medium";
    if (originalSizeMB > 500) compressionLevel = "extreme";
    else if (originalSizeMB > 300) compressionLevel = "heavy";
    else if (originalSizeMB > 150) compressionLevel = "medium";
    else compressionLevel = "light";

    console.log(`Using ${compressionLevel} compression...`);

    // Nén video
    await compressVideo(inputPath, outputPath, compressionLevel);

    // Đọc file đã nén
    const compressedBuffer = fs.readFileSync(outputPath);
    const compressedSizeMB = compressedBuffer.length / (1024 * 1024);

    console.log(
      `Compression completed: ${originalSizeMB.toFixed(
        2
      )}MB → ${compressedSizeMB.toFixed(2)}MB`
    );
    console.log(
      `Compression ratio: ${(
        (1 - compressedSizeMB / originalSizeMB) *
        100
      ).toFixed(1)}%`
    );

    // Nếu file nén vẫn quá lớn, thử nén extreme hơn
    if (compressedSizeMB > 100 && compressionLevel !== "extreme") {
      console.log("File still too large, applying extreme compression...");
      fs.unlinkSync(outputPath); // Xóa file nén cũ

      await compressVideo(inputPath, outputPath, "extreme");
      const extremeCompressedBuffer = fs.readFileSync(outputPath);
      const extremeCompressedSizeMB =
        extremeCompressedBuffer.length / (1024 * 1024);

      console.log(
        `Extreme compression: ${compressedSizeMB.toFixed(
          2
        )}MB → ${extremeCompressedSizeMB.toFixed(2)}MB`
      );

      return await uploadCompressedVideo(
        extremeCompressedBuffer,
        folderName,
        options
      );
    }

    // Upload file đã nén
    return await uploadCompressedVideo(compressedBuffer, folderName, options);
  } catch (error) {
    console.error("Large video upload error:", error);
    throw error;
  } finally {
    // Cleanup temp files
    try {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    } catch (cleanupError) {
      console.warn("Cleanup error:", cleanupError);
    }
  }
};

// Hàm upload video đã nén
const uploadCompressedVideo = async (
  compressedBuffer,
  folderName,
  options = {}
) => {
  const fileSizeMB = compressedBuffer.length / (1024 * 1024);

  if (fileSizeMB > 100) {
    throw new Error(
      `Compressed video still too large: ${fileSizeMB.toFixed(
        2
      )}MB. Consider further compression or splitting the video.`
    );
  }

  return await streamUploadVideo(compressedBuffer, folderName, {
    ...options,
    // Override quality để đảm bảo không nén thêm
    quality: "auto:good",
  });
};

// Hàm chia video thành nhiều phần (nếu cần)
const splitAndUploadVideo = async (fileBuffer, folderName, options = {}) => {
  const tempDir = ensureTempDir();
  const timestamp = Date.now();
  const inputPath = path.join(tempDir, `input_${timestamp}.mp4`);

  try {
    // Lưu buffer thành file tạm
    fs.writeFileSync(inputPath, fileBuffer);

    // Lấy thông tin video
    const videoInfo = await getVideoInfo(inputPath);
    const duration = videoInfo.duration;
    const segmentDuration = Math.ceil(duration / 3); // Chia thành 3 phần

    console.log(
      `Splitting video into segments of ${segmentDuration} seconds each...`
    );

    const uploadResults = [];

    for (let i = 0; i < 3; i++) {
      const outputPath = path.join(tempDir, `segment_${timestamp}_${i}.mp4`);
      const startTime = i * segmentDuration;

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .seekInput(startTime)
          .duration(segmentDuration)
          .videoCodec("libx264")
          .audioCodec("aac")
          .format("mp4")
          .on("end", resolve)
          .on("error", reject)
          .save(outputPath);
      });

      // Upload segment
      const segmentBuffer = fs.readFileSync(outputPath);
      const result = await streamUploadVideo(
        segmentBuffer,
        `${folderName}/segments`,
        {
          ...options,
          public_id: `${options.public_id || "video"}_part_${i + 1}`,
        }
      );

      uploadResults.push(result);
      fs.unlinkSync(outputPath); // Cleanup segment
    }

    return {
      segments: uploadResults,
      totalParts: uploadResults.length,
      originalSize: fileBuffer.length / (1024 * 1024),
    };
  } finally {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
  }
};

// Hàm lấy thông tin video
const getVideoInfo = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      else
        resolve({
          duration: metadata.format.duration,
          bitrate: metadata.format.bit_rate,
          size: metadata.format.size,
        });
    });
  });
};

// Hàm smart upload cho video rất lớn
const smartUploadLargeVideo = async (fileBuffer, folderName, options = {}) => {
  try {
    const fileSizeMB = fileBuffer.length / (1024 * 1024);
    console.log(`Smart upload for video: ${fileSizeMB.toFixed(2)}MB`);

    // Nếu file nhỏ hơn 100MB, upload bình thường
    if (fileSizeMB <= 100) {
      return await streamUploadVideo(fileBuffer, folderName, options);
    }

    // Nếu từ 100-500MB, thử nén trước
    if (fileSizeMB <= 500) {
      console.log("Attempting compression for large video...");
      try {
        return await uploadLargeVideo(fileBuffer, folderName, options);
      } catch (error) {
        console.log("Compression upload failed, trying video splitting...");
        return await splitAndUploadVideo(fileBuffer, folderName, options);
      }
    }

    // Nếu lớn hơn 500MB, chia nhỏ ngay
    console.log("Very large video detected, splitting into segments...");
    return await splitAndUploadVideo(fileBuffer, folderName, options);
  } catch (error) {
    console.error("Smart upload failed:", error);
    throw new Error(`Failed to upload large video: ${error.message}`);
  }
};

// Hàm kiểm tra quota
const getAccountInfo = async () => {
  try {
    const usage = await cloudinaryV2.api.usage();
    console.log("Cloudinary usage:", {
      credits: usage.credits,
      bandwidth: usage.bandwidth,
      storage: usage.storage,
    });
    return usage;
  } catch (error) {
    console.error("Error getting account info:", error);
    throw error;
  }
};

export const CloudinaryProvider = {
  // Original functions
  streamUpload,
  streamUploadVideo,

  // New functions for large videos
  uploadLargeVideo,
  smartUploadLargeVideo,
  splitAndUploadVideo,
  getAccountInfo,

  // Utility functions
  getSupportedFormats: () => ({
    images: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff"],
    videos: ["mp4", "mov", "avi", "wmv", "flv", "webm", "mkv"],
  }),

  getMaxFileSizes: () => ({
    image: 10, // MB
    video: 100, // MB (Cloudinary limit)
    largeVideo: 1000, // MB (with compression)
    extremeVideo: 2000, // MB (with splitting)
  }),

  // Compression levels info
  getCompressionInfo: () => ({
    light: {
      maxSize: 200,
      quality: "1080p",
      description: "Minimal compression",
    },
    medium: {
      maxSize: 300,
      quality: "720p",
      description: "Balanced compression",
    },
    heavy: { maxSize: 500, quality: "480p", description: "High compression" },
    extreme: {
      maxSize: 1000,
      quality: "360p",
      description: "Maximum compression",
    },
  }),
};
