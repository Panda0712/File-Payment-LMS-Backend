import { env } from "~/config/environment";

export const WHITELIST_DOMAINS = [
  "https://trello-clone-opal-psi.vercel.app",
  "https://meo-station.vercel.app",
  "http://localhost:5173",
  "https://fla-dev-lms.vercel.app",
];

export var ACCESS_KEY_MOMO = "F8BBA842ECF85";
export var SECRET_KEY_MOMO = "K951B6PE1waDMi640xX08PD3vg6EkVlz";

export const BOOKING_MODE = {
  night: "in-nights",
  day: "in-day",
};

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const PAYMENT_METHODS = {
  MOMO: "MOMO",
  ZALOPAY: "ZALOPAY",
  CASH: "CASH",
};

export const ZALOPAY_CONFIG = {
  app_id: "2553",
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

export const WEBSITE_DOMAINS =
  env.BUILD_MODE === "production"
    ? env.WEBSITE_DOMAIN_PRODUCTION
    : env.WEBSITE_DOMAIN_DEVELOPMENT;

export const DEFAULT_PAGE = 1;
export const DEFAULT_ITEMS_PER_PAGE = 8;
