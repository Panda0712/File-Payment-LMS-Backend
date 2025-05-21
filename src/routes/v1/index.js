import express from "express";
import { StatusCodes } from "http-status-codes";
import { blogRoute } from "~/routes/v1/blogRoute";
import { courseRoute } from "~/routes/v1/courseRoute";
import { momoRoute } from "~/routes/v1/momoRoute";
import { userRoute } from "~/routes/v1/userRoute";
import { zalopayRoute } from "~/routes/v1/zalopayRoute";

const Router = express.Router();

// Check API V1 Status
Router.get("/status", (req, res) => {
  res.status(StatusCodes.OK).json({
    message: "API V1 are ready to use!",
    code: StatusCodes.OK,
    timestamp: new Date().toISOString(),
  });
});

// Users
Router.use("/users", userRoute);

// Hotels
Router.use("/courses", courseRoute);

// Blogs
Router.use("/blogs", blogRoute);

// Payment MOMO
Router.use("/payment/momo", momoRoute);

// Payment ZALOPAY
Router.use("/payment/zalopay", zalopayRoute);

export const APIs_V1 = Router;
