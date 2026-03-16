import { Like } from "../models/like.models.js";
import asyncHandler from "../utils/asynchandler.js";
import APIError from "../utils/api-error.js"
import { APIResponse } from "../utils/api-response.js";


export const toggleLike = asyncHandler(async (req, res) => {

    const { contentType, contentId } = req.body
    const userId = req.user._id

    if (!contentType || !contentId) {
        throw new APIError(400, "contentType and contentId are required")
    }

    const existingLike = await Like.findOne({
        contentType,
        contentId,
        likedBy: userId
    })

    // UNLIKE
    if (existingLike) {

        await Like.deleteOne({ _id: existingLike._id })

        return res.status(200).json(
            new APIResponse(200, {}, "Unliked successfully")
        )
    }

    // LIKE
    const like = await Like.create({
        contentType,
        contentId,
        likedBy: userId
    })

    return res.status(200).json(
        new APIResponse(200, like, "Liked successfully")
    )

});

export const getLikeCount = asyncHandler(async (req, res) => {

    const { contentType, contentId } = req.params

    const likeCount = await Like.countDocuments({
        contentType,
        contentId
    })

    return res.status(200).json(
        new APIResponse(200, likeCount, "Likes fetched successfully")
    )

});

export const getLikeStatus = asyncHandler(async (req, res) => {

    const { contentType, contentId } = req.params
    const userId = req.user._id

    const like = await Like.findOne({
        contentType,
        contentId,
        likedBy: userId
    })

    return res.status(200).json(
        new APIResponse(200, { isLiked: !!like }, "Like status fetched")
    )

});