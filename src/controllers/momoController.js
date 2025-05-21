import { StatusCodes } from "http-status-codes";
import { momoService } from "~/services/momoService";

const createPayment = async (req, res, next) => {
  try {
    const results = await momoService.createPayment(req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

const callbackPayment = async (req, res, next) => {
  try {
    const result = await momoService.callbackPayment(req.body);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const checkTransactionStatus = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const result = await momoService.checkTransactionStatus(orderId);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const momoController = {
  createPayment,
  callbackPayment,
  checkTransactionStatus,
};
