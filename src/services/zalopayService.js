import axios from "axios";
import CryptoJS from "crypto-js";
import moment from "moment";
import { orderModel } from "~/models/orderModel";
import { BOOKING_STATUS, ZALOPAY_CONFIG } from "~/utils/constants";

const createPayment = async (reqData) => {
  const bookingInfoData = reqData;

  // Tính tổng amount nếu là mảng nhiều items
  const amount = Array.isArray(bookingInfoData)
    ? bookingInfoData.reduce((sum, item) => sum + item.totalPrice, 0)
    : bookingInfoData.totalPrice;

  const embed_data = {
    redirecturl: "http://localhost:5173/order/complete",
    amount,
    bookingInfoData,
  };

  const items = Array.isArray(bookingInfoData) ? bookingInfoData : [{}];
  const transID = Math.floor(Math.random() * 1000000);
  const order = {
    app_id: ZALOPAY_CONFIG.app_id,
    app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
    app_user: "user123",
    app_time: Date.now(),
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: amount,
    description: `Lazada - Payment for the order #${transID}`,
    bank_code: "",
    callback_url:
      "https://8a9d-115-73-27-94.ngrok-free.app/v1/payment/zalopay/callback",
  };

  const data =
    ZALOPAY_CONFIG.app_id +
    "|" +
    order.app_trans_id +
    "|" +
    order.app_user +
    "|" +
    order.amount +
    "|" +
    order.app_time +
    "|" +
    order.embed_data +
    "|" +
    order.item;
  order.mac = CryptoJS.HmacSHA256(data, ZALOPAY_CONFIG.key1).toString();

  try {
    const result = await axios.post(ZALOPAY_CONFIG.endpoint, null, {
      params: order,
    });

    return result.data;
  } catch (error) {
    throw new Error(error);
  }
};

const callbackPayment = async (reqData) => {
  let result = {};

  try {
    let dataStr = reqData.data;
    let reqMac = reqData.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, ZALOPAY_CONFIG.key2).toString();

    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      let dataJson = JSON.parse(dataStr, ZALOPAY_CONFIG.key2);
      console.log(
        "update order's status = success where app_trans_id =",
        dataJson["app_trans_id"]
      );

      const embedData = JSON.parse(dataJson["embed_data"]);

      const bookingInfoData = embedData.bookingInfoData;

      if (!bookingInfoData) {
        console.error("Booking info data not found in embed_data");
        result.return_code = 0;
        result.return_message = "missing_booking_data";
        return result;
      }

      let updateData;
      if (Array.isArray(bookingInfoData)) {
        updateData = bookingInfoData.map((item) => ({
          ...item,
          status: BOOKING_STATUS.COMPLETED,
        }));
      } else {
        updateData = {
          ...bookingInfoData,
          status: BOOKING_STATUS.COMPLETED,
        };
      }

      const createdBooking = await orderModel.createNew(updateData);

      result.return_code = 1;
      result.return_message = "success";

      return createdBooking;
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const zalopayService = { createPayment, callbackPayment };
