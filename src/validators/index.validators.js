import { body } from "express-validator";

export const userChangePasswordValidator = () => {
    return [
        body("oldPassword")
            .notEmpty()
            .withMessage("Old Passowrd is required"),
        body("newPassword")
            .notEmpty()
            .withMessage("New Passowrd is required"),
    ]
}