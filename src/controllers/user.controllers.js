import asyncHandler from "../utils/asynchandler.js";
import APIError from "../utils/api-error.js"
import { User } from "../models/user.models.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { APIResponse } from "../utils/api-response.js";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new APIError(
            500,
            "Something went wrong while generating access token",
        )
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //TODO
    const { fullName, email, username, password } = req.body;

    //validation
    if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
        throw new APIError(400, "All fields are quired");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new APIError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (!avatarLocalPath) {
        throw new APIError(400, "Avatar file is missing");
    }
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    if (!avatar) {
        throw new APIError(400, "Avatar upload failed")
    }

    let user;
    try {
        user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })

    } catch (error) {
        const avatarPublicId = user.avatar
            .split("/")
            .pop()
            .split(".")[0];


        const coverPublicId = user.coverImage
            .split("/")
            .pop()
            .split(".")[0];
        await deleteFromCloudinary(avatarPublicId);
        await deleteFromCloudinary(coverPublicId);
        console.log("Something went wrong while registering a user");
    }
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new APIError(500, "Something went wrong while registering a user");
    }

    return res
        .status(201)
        .json(new APIResponse(200, createdUser, "User Registered Successfully"));
});


export const login = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if (!email || !password) {
        throw new APIError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new APIError(404, "User does not exists");
    }

    const isPasswordvalid = await user.isPasswordCorrect(password);

    if (!isPasswordvalid) {
        throw new APIError(400, "Invallid Credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new APIResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
                "User logged in successfully")
        )
});

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true,
        },
    );
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new APIResponse(200, {}, "User logged out")
        )
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    res
        .status(200)
        .json(
            new APIResponse(
                200,
                req.user,
                "Current user fetched successfully"
            )
        );
});


export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new APIError(
            401,
            "Unauthorized Access"
        )
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new APIError(401,
                "Invalid Refresh Token(User)"
            );
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new APIError(401,
                "Refresh Token is Expired"
            );
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        user.refreshToken = newRefreshToken;
        await user.save();

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new APIResponse(
                    200,
                    {
                        accessToken, refreshToken: newRefreshToken
                    },
                    "Access Token Refreshed"
                )
            )
    } catch (error) {
        throw new APIError(401,
            "Invalid Refresh Token"
        );
    }
})

export const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
        throw new APIError(404,
            "User does not exists", []
        )
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail(
        {
            email: user?.email,
            subject: "Password reset request",
            mailgenContent: forgotPasswordMailGenContent(
                user.username,
                `${FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
            ),
        }
    );

    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                {},
                "Password reset request hhas been sent on you email id"
            )
        )
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params
    const { newPassword } = req.body

    let hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    })

    if (!user) {
        throw new APIError(
            400,
            "Token is invalid or expired"
        );
    }

    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    user.password = newPassword;

    user.save({ validateBeforeSave: false });

    return res
        .json(
            new APIResponse(200,
                {},
                "Password reset successfully"
            )
        );
});

export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordValid) {
        throw new APIError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new APIResponse(200,
                {},
                "Password changed successfully"
            )
        )
});

export const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const { username, fullName } = req.body;

    const user = await User.findByIdAndUpdate(
        userId,
        {
            username,
            fullName
        }, { new: true }
    );

    if (!user) {
        throw new APIError(400, "User not found");
    }

    return res
        .status(200)
        .json(
            new APIResponse(200, user, "Profile Updated successfully")
        )
});

export const updateAvatar = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId);

    const oldAvatar = user.avatar;
    const publicId = oldAvatar
        .split("/")
        .pop()
        .split(".")[0];



    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (!avatarLocalPath) {
        throw new APIError(400, "Avatar file is missing");
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath);


    if (!avatar) {
        throw new APIError(400, "Avatar upload failed");
    }

    user.avatar = avatar.url;

    await user.save({ validateBeforeSave: false });

    try {
        await deleteFromCloudinary(publicId);
    } catch (error) {
        console.log("Delete From cloudinary failed", error);
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200, user, "Avatar Updated Successfully"
            )
        )

});

export const updateCoverImage = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId);

    const oldCover = user.coverImage;
    const publicId = oldCover
        .split("/")
        .pop()
        .split(".")[0];

    const coverLocalPath = req.files?.coverImage?.[0]?.path;

    if (!coverLocalPath) {
        throw new APIError(400, "Cover image is missing");
    }

    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if (!coverImage) {
        throw new APIError(400, "Cover Image upload failed");
    }

    user.coverImage = coverImage.url;

    await user.save({ validateBeforeSave: false });

    try {
        await deleteFromCloudinary(publicId);
    } catch (error) {
        console.log("Delete From cloudinary failed", error);
    }

    return res
        .status(200)
        .json(
            new APIResponse(
                200, user, "Cover Image Updated Successfully"
            )
        )


});

export {
    registerUser
}