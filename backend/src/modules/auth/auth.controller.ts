import { Request, Response } from "express";
import { AuthPayload } from "@/common/middleware/auth.middleware";
import * as authService from "./auth.service";

export const register = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;
  const data = await authService.register(fullName, email, password);
  res.status(201).json({ success: true, data });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  res.json({ success: true, data });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const data = await authService.refreshToken(refreshToken);
  res.json({ success: true, data });
};

export const getMe = async (req: Request, res: Response) => {
  const authUser = req.user as AuthPayload;
  const data = await authService.getMe(authUser.sub);
  res.json({ success: true, data });
};

export const deleteAccount = async (req: Request, res: Response) => {
  const authUser = req.user as AuthPayload;
  await authService.deleteAccount(authUser.sub);
  res.json({ success: true, message: "Account deactivated successfully" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res.json({
    success: true,
    message:
      "If an account with that email exists, a password reset link has been sent",
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  res.json({ success: true, message: "Password has been reset successfully" });
};