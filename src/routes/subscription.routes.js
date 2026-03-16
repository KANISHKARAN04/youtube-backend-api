import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { getSubscribed, subscribe, subscribed, subscribersCount, unSubscribe } from "../controllers/subscription.controllers.js";

const router = Router();

router.route("/subscribe/:channelId").post(verifyJWT, validate, subscribe);
router.route("/unsubscribe/:channelId").post(verifyJWT, validate, unSubscribe);
router.route("/subscription-status/:channelId").get(verifyJWT, validate, subscribed);
router.route("/subscription-count/:channelId").get(verifyJWT, validate, subscribersCount);
router.route("/subscription-count/").get(verifyJWT, validate, getSubscribed);


export default router;