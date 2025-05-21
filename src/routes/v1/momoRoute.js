import express from "express";
import { momoController } from "~/controllers/momoController";
import { momoValidation } from "~/validations/momoValidation";

const Router = express.Router();

Router.route("/").post(
  momoValidation.createPayment,
  momoController.createPayment
);

Router.route("/callback").post(
  momoValidation.callbackPayment,
  momoController.callbackPayment
);

Router.route("/transaction-status").post(
  momoValidation.checkTransactionStatus,
  momoController.checkTransactionStatus
);

export const momoRoute = Router;
