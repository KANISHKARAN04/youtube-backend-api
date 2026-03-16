import asyncHandler from "../utils/asynchandler.js";
import APIError from "../utils/api-error.js"
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";

import { Comment } from "../models/comment.models.js";
import { APIResponse } from "../utils/api-response.js";
import mongoose from "mongoose";
import { Tweet } from "../models/tweet.models.js";

export const postTweet = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { content } = req.body;

    const user = await User.findById(userId);


    const tweet = await Tweet.create({
        content,
        owner: userId
    });

    if (!tweet) {
        throw new APIError(404, "Something went wrong");
    }

    return res
        .status(200)
        .json(
            new APIResponse(200, tweet, "Tweet  posted successfully")
        )

});

export const deleteTweet = asyncHandler(async (req, res) => {
    const ownerId = req.user._id;
    const { tweetId } = req.params;

    const deleteTweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: ownerId
    });

    if (!deleteTweet) {
        throw new APIError(400, "Tweet not found");
    }

    return res
        .status(200)
        .json(
            new APIResponse(200, {}, "Tweet deleted Successfully")
        )
});

export const updateTweet = asyncHandler(async (req, res) => {
    const ownerId = req.user._id;
    const { tweetId } = req.params;
    const { content } = req.body;

    const updateTweet = await Tweet.findOne({
        _id: tweetId,
        owner: ownerId
    });

    if (!updateTweet) {
        throw new APIError(400, "Tweet not found");
    }

    if (content) updateTweet.content = content;

    await updateTweet.save();

    return res
        .status(200)
        .json(
            new APIResponse(200, {}, "Tweet updated Successfully")
        )
});

export const getTweetCount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const tweet = await Tweet.countDocuments({
        owner: userId
    });


    return res
        .status(200)
        .json(
            new APIResponse(200, tweet, "Tweet count fetched successfully")
        )
});