import asyncHandler from "../utils/asynchandler.js";
import APIError from "../utils/api-error.js"
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";

import { Comment } from "../models/comment.models.js";
import { APIResponse } from "../utils/api-response.js";
import mongoose from "mongoose";

export const postComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    const video = await Video.findById(videoId);

    if (!content) {
        throw new APIError(400, "Content is required");
    }

    if (!video) {
        throw new APIError(404, "Video doesn't exists");
    }


    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.User._id
    });

    if (!comment) {
        throw new APIError(404, "Something went wrong");
    }

    return res
        .status(200)
        .json(
            new APIResponse(200, comment, "Comment posted successfully")
        )

});

export const deleteComment = asyncHandler(async (req, res) => {
    const { videoId, commentId } = req.params;

    const deleteComment = await Comment.findOneAndDelete({
        _id: commentId,
        video: videoId,
        owner: req.user._id
    });

    if (!deleteComment) {
        throw new APIError(400, "Comment not found");
    }

    return res
        .status(200)
        .json(
            new APIResponse(200, {}, "Comment deleted Successfully")
        )
});

export const updateComment = asyncHandler(async (req, res) => {
    const { videoId, commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new APIError(400, "Content is required");
    }

    const updateComment = await Comment.findOne({
        _id: commentId,
        video: videoId,
        owner: req.user._id
    });

    if (!updateComment) {
        throw new APIError(400, "Comment not found");
    }

    if (content) updateComment.content = content;

    await updateComment.save();

    return res
        .status(200)
        .json(
            new APIResponse(200, {}, "Comment updated Successfully")
        )
});

export const getCommentCount = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const commentCount = await Comment.countDocuments({
        video: videoId
    });


    return res
        .status(200)
        .json(
            new APIResponse(200, commentCount, "Comment count fetched successfully")
        )
});

export const getComments = asyncHandler(async (req, res) => {

    const { videoId } = req.params;


    const comments = await Comment.find({ video: videoId }).populate("owner", "username avatar").sort({ createdAt: -1 });

    if (!comments) {
        throw new APIError(400, "No comments");
    }

    return res
        .status(200)
        .json(
            new APIResponse(200, comments, "Comments fetched successfully")
        )
});