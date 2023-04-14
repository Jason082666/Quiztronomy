import { Router } from "express";
const router = Router();
import { catchError } from "../../util/catcherror.js";
import {
  userLogin,
  userSignup,
  userLogout,
  userLoginStatus,
} from "../controller/user.js";

router.route("/user/signup").post(catchError(userSignup));
router.route("/user/login").post(catchError(userLogin));
router.route("/user/logout").post(catchError(userLogout));
router.route("/user/status").get(catchError(userLoginStatus));

export default router;
