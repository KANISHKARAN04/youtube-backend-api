import { Router } from "express";
import { changePassword, getCurrentUser, login, logoutUser, registerUser, updateAvatar, updateCoverImage, updateProfile } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { userChangePasswordValidator } from "../validators/index.validators.js";

import { validate } from "../middlewares/validator.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, userChangePasswordValidator(), validate, changePassword);
router.route("/update-profile").put(verifyJWT, validate, updateProfile);
router.route("/update-avatar").patch(verifyJWT, validate,
    upload.fields([
        { name: "avatar", maxCount: 1 }
    ]), updateAvatar);
router.route("/update-cover").patch(verifyJWT, validate,
    upload.fields([
        { name: "coverImage", maxCount: 1 }
    ]), updateCoverImage);

export default router;