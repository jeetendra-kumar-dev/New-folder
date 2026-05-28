import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  loginBodySchema,
  refreshTokenBodySchema,
  requestOtpBodySchema,
  signupBodySchema,
  verifyOtpBodySchema,
} from "../types/auth";
import * as authController from "../controllers/auth.controller";

const router = Router();

router.post("/signup", validate({ body: signupBodySchema }), authController.signup);
router.post("/register", validate({ body: signupBodySchema }), authController.register);
router.post("/login", validate({ body: loginBodySchema }), authController.login);
router.post("/otp/request", validate({ body: requestOtpBodySchema }), authController.requestEmailOtp);
router.post("/otp/verify", validate({ body: verifyOtpBodySchema }), authController.verifyEmailOtp);
router.post("/refresh", validate({ body: refreshTokenBodySchema }), authController.refresh);
router.post("/logout", validate({ body: refreshTokenBodySchema }), authController.logout);
router.get("/me", authenticate, authController.me);

export { router as authRoutes };
