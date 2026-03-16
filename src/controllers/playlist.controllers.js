import asyncHandler from "../utils/asynchandler.js";
import APIError from "../utils/api-error.js";
import { APIResponse } from "../utils/api-response.js";

import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";

import mongoose from "mongoose";


export const createPlaylist = asyncHandler(async (req, res) => {

    const { name, description } = req.body;

    if (!name) {
        throw new APIError(400, "Playlist name is required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    });

    return res.status(201).json(
        new APIResponse(201, playlist, "Playlist created successfully")
    );
});


export const getUserPlaylists = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const playlists = await Playlist.find({
        owner: userId
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new APIResponse(200, playlists, "User playlists fetched successfully")
    );
});



export const getPlaylistById = asyncHandler(async (req, res) => {

    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId)
        .populate("videos", "title thumbnail views duration")
        .populate("owner", "fullName username avatar");

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    return res.status(200).json(
        new APIResponse(200, playlist, "Playlist fetched successfully")
    );
});


export const addVideoToPlaylist = asyncHandler(async (req, res) => {

    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new APIError(404, "Video not found");
    }

    if (playlist.videos.includes(videoId)) {
        throw new APIError(400, "Video already in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res.status(200).json(
        new APIResponse(200, playlist, "Video added to playlist")
    );
});


export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }
        },
        { new: true }
    );

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    return res.status(200).json(
        new APIResponse(200, playlist, "Video removed from playlist")
    );
});


export const updatePlaylist = asyncHandler(async (req, res) => {

    const { playlistId } = req.params;
    const { name, description } = req.body;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    if (name) playlist.name = name;
    if (description) playlist.description = description;

    await playlist.save();

    return res.status(200).json(
        new APIResponse(200, playlist, "Playlist updated successfully")
    );
});


export const deletePlaylist = asyncHandler(async (req, res) => {

    const { playlistId } = req.params;

    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) {
        throw new APIError(404, "Playlist not found");
    }

    return res.status(200).json(
        new APIResponse(200, {}, "Playlist deleted successfully")
    );
});