import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { userChangePasswordValidator } from "../validators/index.validators.js";

import { validate } from "../middlewares/validator.middleware.js";
import { deleteTweet, getTweetCount, postTweet, updateTweet } from "../controllers/tweet.controllers.js";
const router = Router();

router.route("/post-tweet").post(verifyJWT, validate, postTweet);
router.route("/delete-tweet/:tweetId").delete(verifyJWT, validate, deleteTweet);
router.route("/update-tweet/:tweetId").put(verifyJWT, validate, updateTweet);
router.route("/tweet-count").get(verifyJWT, validate, getTweetCount);

export default router;