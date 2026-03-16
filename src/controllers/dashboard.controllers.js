import asyncHandler from "../utils/asynchandler.js";
import { APIResponse } from "../utils/api-response.js";
import APIError from "../utils/api-error.js";

import mongoose from "mongoose";

import { Video } from "../models/video.models.js";
import { Like } from "../models/like.models.js";
import { Comment } from "../models/comment.models.js";
import { Subscription } from "../models/subscription.models.js";


// 1️⃣ Channel Stats
export const getChannelStats = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const totalVideos = await Video.countDocuments({
        owner: userId
    });

    const totalViews = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ]);

    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    });

    const videoIds = await Video.find({ owner: userId }).distinct("_id");

    const totalLikes = await Like.countDocuments({
        contentType: "Video",
        contentId: { $in: videoIds }
    });

    const totalComments = await Comment.countDocuments({
        video: { $in: videoIds }
    });

    const stats = {
        totalVideos,
        totalViews: totalViews[0]?.totalViews || 0,
        totalSubscribers,
        totalLikes,
        totalComments
    };

    return res.status(200).json(
        new APIResponse(200, stats, "Channel stats fetched successfully")
    );

});


// 2️⃣ Channel Videos (Dashboard list)
export const getChannelVideos = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const videos = await Video.find({
        owner: userId
    })
        .select("title thumbnail views createdAt isPublished")
        .sort({ createdAt: -1 });

    if (!videos) {
        throw new APIError(404, "Videos not found");
    }

    return res.status(200).json(
        new APIResponse(200, videos, "Channel videos fetched successfully")
    );

});