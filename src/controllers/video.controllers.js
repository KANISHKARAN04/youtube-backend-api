import asyncHandler from "../utils/asynchandler.js";
import APIError from "../utils/api-error.js"
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { APIResponse } from "../utils/api-response.js";
import mongoose from "mongoose";

export const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const ownerId = req.user._id;

    const videoPath = req.files?.videoFile?.[0]?.path;

    if (!videoPath) {
        throw new APIError(400, "Video File is missing");
    }

    const videoFile = await uploadOnCloudinary(videoPath);


    if (!videoFile) {
        throw new APIError(400, "Video upload failed");
    }

    const thumbnailPath = req.files?.thumbnail?.[0]?.path;

    if (!thumbnailPath) {
        throw new APIError(400, "Thumbnail File is missing");
    }

    const thumbnailFile = await uploadOnCloudinary(thumbnailPath);


    if (!thumbnailFile) {
        throw new APIError(400, "Thumbnail upload failed");
    }


    let video;
    try {
        video = await Video.create({
            videoFile: videoFile.url,
            thumbnail: thumbnailFile.url,
            title,
            description,
            duration: videoFile.duration,
            views: 0,
            isPublished: false,
            owner: new mongoose.Types.ObjectId(ownerId)
        });

        if (!video) {
            throw new APIError(500, "Video creation failed");
        }

    } catch (error) {
        const videoPublicId = video.videoFile
            .split("/")
            .pop()
            .split(".")[0];


        const thumbnailPublicId = video.thumbnail
            .split("/")
            .pop()
            .split(".")[0];
        await deleteFromCloudinary(videoPublicId);
        await deleteFromCloudinary(thumbnailPublicId);
        console.log("Something went wrong while uploading a video");
    }

    const uploadedVideo = await Video.findById(video._id).select(
        "-description -duration"
    )

    if (!uploadedVideo) {
        throw new APIError(400, "Something went wrong while uploading a video");
    }

    return res
        .status(200)
        .json(new APIResponse(200, uploadedVideo, "Video Uploaded successfully"));
});



export const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(
        videoId
    );


    if (!video) {
        throw new APIError(400, "Video doesn't exists");
    }

    const videoPublicId = video.videoFile
        .split("/")
        .pop()
        .split(".")[0];


    const thumbnailPublicId = video.thumbnail
        .split("/")
        .pop()
        .split(".")[0];

    const deletedVideo = await Video.findByIdAndDelete(
        video._id
    );

    if (!deletedVideo) {
        throw new APIError(404, "Something went wrong while deleting a video");
    }

    try {
        await deleteFromCloudinary(videoPublicId);
        await deleteFromCloudinary(thumbnailPublicId);
    } catch (error) {
        console.log("Delete From cloudinary failed", error);
    }


    return res
        .status(200)
        .json(
            new APIResponse(200, deletedVideo, "Video deleted successfully")
        )
});

export const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findOne({
        _id: videoId,
        isPublished: true
    });


    if (!video) {
        throw new APIError(400, "Video doesn't exists");
    }

    return res
        .status(200)
        .json(
            new APIResponse(200, video, "Video fetched successfully")
        )
});

export const getAllVideos = asyncHandler(async (req, res) => {
    const video = await Video.find({ isPublished: true });

    if (!video) {
        throw new APIError(400, "Video doesn't exists");
    }

    return res
        .status(200)
        .json(
            new APIResponse(200, video, "Videos fetched successfully")
        )
});

export const publishVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findByIdAndUpdate(videoId, {
        $set: {
            isPublished: true
        }
    }, { new: true }
    );

    if (!video) {
        throw new APIError(400, "Video doesn't exists");
    }

    return res
        .status(200)
        .json(
            new APIResponse(200, video, "Video published successfully")
        )
});

export const watchVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;


    const user = await User.findById(userId);

    if (!user.watchHistory.includes(videoId)) {
        await Video.findByIdAndUpdate(videoId, {
            $inc: { views: 1 }
        });

        await User.findByIdAndUpdate(userId, {
            $addToSet: {
                watchHistory: videoId
            }
        });
    }

    return res.status(200).json(
        new APIResponse(200, {}, "Watch recorded")
    )
});

export const getWatchHistory = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const history = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            videoFile: 1,
                            title: 1,
                            thumbnail: 1
                        }
                    }
                ],
                as: "watchHistory"
            }
        },
    ]);


    return res.status(200).json(
        new APIResponse(200, history[0]?.watchHistory || [], "Watch history fetched")
    );
});

export const updateVideo = asyncHandler(async (req, res) => {

    const { title } = req.body;
    const { description } = req.body;
    const { videoId } = req.params;
    const video = await Video.findById(videoId);

    if (!video) {
        throw new APIError(404, "Video not found");
    }

    const oldVideo = video.videoFile;
    const oldThumbnail = video.thumbnail;
    const videoPublicId = oldVideo
        .split("/")
        .pop()
        .split(".")[0];

    const thumbnailPublicId = oldThumbnail
        .split("/")
        .pop()
        .split(".")[0];


    const updateVideoPath = req.files?.updateVideo?.[0]?.path;
    const thumbnailPath = req.files?.updateThumbnail?.[0]?.path;

    if (title) video.title = title;

    if (description) video.description = description;

    if (updateVideoPath) {
        const updatedvideo = await uploadOnCloudinary(updateVideoPath);

        video.videoFile = updatedvideo.url;

        await deleteFromCloudinary(videoPublicId);
    }

    if (thumbnailPath) {
        const updatedThumbnail = await uploadOnCloudinary(thumbnailPath);

        video.thumbnail = updatedThumbnail.url;

        await deleteFromCloudinary(thumbnailPublicId);
    }

    await video.save();

    return res.status(200).json(
        new APIResponse(200, [], "Video updated successfully")
    );
});