import { Router } from "express";
const router = Router();
import { catchError } from "../../util/catcherror.js";
import { userLogin, userSignup,userLogout } from "../controller/user.js";

router.route("/user/signup").post(catchError(userSignup));
router.route("/user/login").post(catchError(userLogin));
router.route("/user/logout").post(catchError(userLogout));

export default router;
