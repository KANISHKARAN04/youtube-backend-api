import {APIResponse} from "../utils/api-response.js";
import asyncHandler from "../utils/asynchandler.js";

const healthCheck = asyncHandler(async(req,res)=>{
    return res
        .status(200)
        .json(new APIResponse(200,"OK","Health check passed"));
});

export {healthCheck};