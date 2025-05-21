import axios from "axios";
import crypto from "crypto";
import { orderModel } from "~/models/orderModel";
import {
  ACCESS_KEY_MOMO,
  BOOKING_STATUS,
  SECRET_KEY_MOMO,
} from "~/utils/constants";

const createPayment = async (reqData) => {
  const bookingInfoData = reqData;

  // Tính tổng amount nếu là mảng nhiều items
  const amount = Array.isArray(bookingInfoData)
    ? bookingInfoData.reduce((sum, item) => sum + item.totalPrice, 0)
    : bookingInfoData.totalPrice;

  var orderInfo = "pay with MoMo";
  var partnerCode = "MOMO";
  var redirectUrl = "http://localhost:5173/order/complete";
  var ipnUrl =
    "https://4810-115-73-27-94.ngrok-free.app/v1/payment/momo/callback";
  var requestType = "payWithMethod";
  var orderId = partnerCode + new Date().getTime();
  var requestId = orderId;
  var extraData = Buffer.from(JSON.stringify(bookingInfoData)).toString(
    "base64"
  );
  var orderGroupId = "";
  var autoCapture = true;
  var lang = "vi";

  var rawSignature =
    "accessKey=" +
    ACCESS_KEY_MOMO +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;

  var signature = crypto
    .createHmac("sha256", SECRET_KEY_MOMO)
    .update(rawSignature)
    .digest("hex");

  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    orderData: bookingInfoData,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: extraData,
    orderGroupId: orderGroupId,
    signature: signature,
  });

  const options = {
    method: "POST",
    url: "https://test-payment.momo.vn/v2/gateway/api/create",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
    data: requestBody,
  };

  try {
    const result = await axios(options);
    return result.data;
  } catch (error) {
    throw new Error(error);
  }
};

const callbackPayment = async (reqData) => {
  const { extraData, resultCode } = reqData;

  if (resultCode !== 0) {
    console.log("Payment failed with code:", resultCode);
    return { success: false, message: "Payment failed" };
  }

  let bookingData;
  if (extraData) {
    try {
      bookingData = JSON.parse(
        Buffer.from(extraData, "base64").toString("utf-8")
      );
    } catch (error) {
      throw new Error("Failed to parse extraData: " + error.message);
    }
  }

  let updatedBookings;
  if (Array.isArray(bookingData)) {
    updatedBookings = bookingData.map((item) => ({
      ...item,
      status: BOOKING_STATUS.COMPLETED,
    }));
  } else {
    updatedBookings = [
      {
        ...bookingData,
        status: BOOKING_STATUS.COMPLETED,
      },
    ];
  }

  const createdBookings = await orderModel.createNew(updatedBookings);
  return createdBookings;
};

const checkTransactionStatus = async (id) => {
  const rawSignature = `accessKey=${ACCESS_KEY_MOMO}&orderId=${id}&partnerCode=MOMO&requestId=${id}`;

  const signature = crypto
    .createHmac("sha256", SECRET_KEY_MOMO)
    .update(rawSignature)
    .digest("hex");

  const requestBody = JSON.stringify({
    partnerCode: "MOMO",
    requestId: id,
    orderId: id,
    signature: signature,
    lang: "vi",
  });

  const options = {
    method: "POST",
    url: "https://test-payment.momo.vn/v2/gateway/api/query",
    headers: {
      "Content-Type": "application/json",
    },
    data: requestBody,
  };

  try {
    const result = await axios(options);
    return result.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const momoService = {
  createPayment,
  callbackPayment,
  checkTransactionStatus,
};
