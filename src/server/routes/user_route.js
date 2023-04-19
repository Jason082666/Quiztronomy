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

router.route("/user/signup").post(catchError(userSignup));
router.route("/visitor/login").post(catchError(visiterLogin));
router.route("/user/login").post(catchError(userLogin));
router.route("/user/logout").post(catchError(userLogout));
router.route("/user/status").get(catchError(userLoginStatus));

export default router;
