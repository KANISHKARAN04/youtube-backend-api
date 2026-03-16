import asyncHandler from "../utils/asynchandler.js";
import APIError from "../utils/api-error.js"
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { APIResponse } from "../utils/api-response.js";
import mongoose from "mongoose";
import { Subscription } from "../models/subscription.models.js";

export const subscribe = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { channelId } = req.params;

    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    });

    if (existingSubscription) {
        throw new APIError(400, "Already subscribed");
    }

    if (!userId || !channelId) {
        throw new APIError(404, "All fields are required");
    }

    const subscribe = await Subscription.create({
        subscriber: userId,
        channel: channelId
    });

    if (!subscribe) {
        throw new APIError(404, "Subscription not found")
    }

    return res
        .status(200)
        .json(
            new APIResponse(200, subscribe, "Subscribed successfully")
        )
});

export const unSubscribe = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { channelId } = req.params;

    const unsubscribe = await Subscription.findOneAndDelete({
        subscriber: userId,
        channel: channelId
    });

    if (!unsubscribe) {
        throw new APIError(404, "Subscription not found");
    }

    return res
        .status(200)
        .json(
            new APIResponse(200, unsubscribe, "Unsubscribed successfully")
        )
});


export const subscribed = asyncHandler(async (req, res) => {

    const userId = req.user._id;
    const { channelId } = req.params;


    const isSubscribed = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    });

    if (!isSubscribed) {
        throw new APIError(404, "Subscription not found");
    }

    return res
        .status(200)
        .json(
            new APIResponse(200, isSubscribed, "You subscribed this channel")
        )
});

export const subscribersCount = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const subscriberCount = await Subscription.countDocuments({
        channel: channelId
    });

    if (!subscriberCount) {
        throw new APIError(400, "Not found");
    }

    return res
        .status(200)
        .json(
            new APIResponse(200, subscriberCount, "Subscribers")
        )

});

export const getSubscribed = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const channelName = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(userId)
            }
        }, {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            fullName: 1
                        }
                    }
                ],
                as: "channel"
            }

        }
    ])

    return res
        .status(200)
        .json(
            new APIResponse(200, channelName, "Subscribed channels fetched successfully")
        );
});