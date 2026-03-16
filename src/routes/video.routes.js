import { Router } from "express";
import { deleteVideo, getAllVideos, getVideoById, getWatchHistory, publishVideo, updateVideo, uploadVideo, watchVideo } from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router.route("/video-upload").post(verifyJWT, validate,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        }, {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    uploadVideo
);

router.route("/delete-video/:videoId").delete(verifyJWT, validate, deleteVideo);
router.route("/get-video/:videoId").get(verifyJWT, validate, getVideoById);
router.route("/get-video").get(verifyJWT, validate, getAllVideos);
router.route("/publish/:videoId").put(verifyJWT, validate, publishVideo);
router.route("/watch-video/:videoId").post(verifyJWT, validate, watchVideo);
router.route("/watch-history").get(verifyJWT, validate, getWatchHistory);
router.route("/update-video/:videoId").put(verifyJWT, validate, updateVideo);

export default router;