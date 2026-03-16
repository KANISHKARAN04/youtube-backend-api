import mongoose, { Schema } from "mongoose";


const likeSchema = new Schema({
    contentType: {
        type: String,
        enum: ["Video", "Comment", "Tweet"],
        required: true
    },
    contentId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "contentType"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
}, { timestamps: true })


likeSchema.index({
    contentType: 1,
    contentId: 1,
    likedBy: 1
}, { unique: true });


export const Like = mongoose.model("Like", likeSchema)