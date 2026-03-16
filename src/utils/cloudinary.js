import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
//configure cloudinary

cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
)

const uploadOnCloudinary = async (localFilePath) => {
    try {

        if (!localFilePath)
            return null

        const response = await cloudinary.uploader.upload(
            localFilePath, {
            resource_type: "auto"
        }
        )
        console.log("File uploaded on cloudinary.File src: " + response.url);

        //once the file is uploaded, we would like to delete it from our server
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response;
    } catch (error) {
        console.log("Cloudinary upload error:", error);

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            return null;
        }
    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
        const response = await cloudinary.uploader.destroy(publicId);
        console.log("Deleted from cloudinary.Public id: " + publicId);
        //once the file is uploaded, we would like to delete it from our server
    } catch (error) {
        console.log("Cloudinary delete error:", error);
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary };