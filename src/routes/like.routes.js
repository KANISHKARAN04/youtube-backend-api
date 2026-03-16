import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { toggleLike, getLikeCount, getLikeStatus } from "../controllers/like.controllers";


const router = Router();


router.post("/likes", verifyJWT, toggleLike)

router.get("/likes/:contentType/:contentId", getLikeCount)

router.get("/likes/status/:contentType/:contentId", verifyJWT, getLikeStatus)

export default router;