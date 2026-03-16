import { User } from "../models/user.models.js";
import APIError from "../utils/api-error.js";
import asyncHandler from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
        throw new APIError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new APIError(401, "INVALID ACCESS TOKEN:(USER)");
        }
        req.user = user;
        next();
    } catch (err) {
        throw new APIError(401, "INVALID ACCESS TOKEN");
    }
})