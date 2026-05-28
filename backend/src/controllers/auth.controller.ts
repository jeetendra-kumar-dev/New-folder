import { sendSuccess } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import * as authService from "../services/auth.service";
import * as userService from "../services/user.service";

export const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);
  return sendSuccess(res, result, "Account created successfully", 201);
});

export const register = signup;

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, result, "Signed in successfully");
});

export const requestEmailOtp = asyncHandler(async (req, res) => {
  const result = await authService.requestEmailOtp(req.body);
  return sendSuccess(res, result, "OTP code sent successfully");
});

export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmailOtp(req.body);
  return sendSuccess(res, result, "Email verified successfully");
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  return sendSuccess(res, result, "Token refreshed successfully");
});

export const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.body.refreshToken);
  return sendSuccess(res, result, "Signed out successfully");
});

export const me = asyncHandler(async (req, res) => {
  const user = await userService.getCurrentUser(req.user!.id);
  return sendSuccess(res, user, "Current user loaded");
});
