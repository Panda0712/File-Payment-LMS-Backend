// validate the ObjectId rules
export const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;
export const OBJECT_ID_RULE_MESSAGE =
  "Your string fails to match the Object Id pattern!";

export const FIELD_REQUIRED_MESSAGE = "Bắt buộc nhập trường này.";
export const EMAIL_RULE = /^\S+@\S+\.\S+$/;
export const EMAIL_RULE_MESSAGE = "Email sai định dạng. (example@gmail.com)";
export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/;
export const PASSWORD_RULE_MESSAGE =
  "Mật khẩu phải có ít nhất 1 chữ cái, 1 chữ số và tối thiểu 8 ký tự.";
export const PASSWORD_CONFIRMATION_MESSAGE = "Mật khẩu nhập lại chưa đúng!";
export const PHONE_RULE =
  /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$/;
export const PHONE_RULE_MESSAGE =
  "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng!";

export const LIMIT_COMMON_FILE_SIZE = 10485760; // byte = 10 MB
export const ALLOW_COMMON_FILE_TYPES = ["image/jpg", "image/jpeg", "image/png"];

export const LIMIT_VIDEO_FILE_SIZE = 262144000; // byte = 250 MB
export const ALLOW_VIDEO_FILE_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/avi",
  "video/mov",
  "video/quicktime",
  "video/x-ms-wmv",
  "video/x-msvideo",
];
