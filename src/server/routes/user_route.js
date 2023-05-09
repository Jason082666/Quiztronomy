import { Router } from "express";
const router = Router();
import { catchError } from "../../util/catcherror.js";
import {
  userLogin,
  userSignup,
  userLogout,
  userLoginStatus,
  visiterLogin,
} from "../controller/user.js";
import { body } from "express-validator";
const validation = [
  body("email").isEmail().withMessage("Please enter email in right format."),
  body("password")
    .matches(/^[A-Z0-9]{6,20}$/i)
    .withMessage(
      "Password should be number or alphabets and should between 6~20 words. "
    ),
];
router.route("/user/signup").post(validation, catchError(userSignup));
router.route("/visitor/login").post(catchError(visiterLogin));
router.route("/user/login").post(catchError(userLogin));
router.route("/user/logout").post(catchError(userLogout));
router.route("/user/status").get(catchError(userLoginStatus));

export default router;
