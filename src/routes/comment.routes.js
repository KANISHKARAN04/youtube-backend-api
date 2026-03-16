import { Router } from "express";

import { upload } from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteComment, getCommentCount, postComment, updateComment } from "../controllers/comment.controllers.js";

import { validate } from "../middlewares/validator.middleware.js";
const router = Router();

router.route("/videos/:videoId/comments/post-comment").post(verifyJWT, validate, postComment);
router.route("/videos/:videoId/comments/delete-comment/:commentId").delete(verifyJWT, validate, deleteComment);
router.route("/videos/:videoId/comments/update-comment/:commentId").put(verifyJWT, validate, updateComment);
router.route("/videos/:videoId/comments/comment-count").get(verifyJWT, validate, getCommentCount);

export default router;