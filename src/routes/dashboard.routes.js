import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    getChannelStats,
    getChannelVideos
} from "../controllers/dashboard.controllers.js";

const router = Router();

router.get("/stats", verifyJWT, getChannelStats);

router.get("/videos", verifyJWT, getChannelVideos);

export default router;