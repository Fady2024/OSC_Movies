import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "@/config/env";
import { User, IUser } from "@/modules/users/user.model";
import { AppError } from "@/common/errors/AppError";
import { emailService } from "@/modules/emails/email.service";
import { AuthResponse } from "./auth.types";

const signToken = (user: IUser): string => {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );
};

const signRefreshToken = (user: IUser): string => {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    env.JWT_SECRET + "_refresh",
    { expiresIn: 30 * 24 * 60 * 60 }
  );
};

const toAuthUser = (user: IUser) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  role: user.role,
});

export const register = async (
  fullName: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email already exists", 409, "DUPLICATE_EMAIL");
  }

  const user = await User.create({ fullName, email, password, role: "customer" });

  return {
    user: toAuthUser(user),
    token: signToken(user),
    refreshToken: signRefreshToken(user),
  };
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }
  if (user.deletedAt) {
    throw new AppError("This account has been deactivated", 401, "ACCOUNT_DELETED");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  return {
    user: toAuthUser(user),
    token: signToken(user),
    refreshToken: signRefreshToken(user),
  };
};

export const refreshToken = async (
  refreshToken: string
): Promise<{ token: string; refreshToken: string }> => {
  if (!refreshToken) {
    throw new AppError("Refresh token required", 400, "MISSING_REFRESH_TOKEN");
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      env.JWT_SECRET + "_refresh"
    ) as { sub: string; email: string; role: string };
    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    if (user.deletedAt) {
      throw new AppError("This account has been deactivated", 401, "ACCOUNT_DELETED");
    }

    return {
      token: signToken(user),
      refreshToken: signRefreshToken(user),
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
  }
};

export const getMe = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }
  if (user.deletedAt) {
    throw new AppError("This account has been deactivated", 401, "ACCOUNT_DELETED");
  }

  return toAuthUser(user);
};

export const deleteAccount = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  user.deletedAt = new Date();
  await user.save();
};

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });
  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    await emailService.sendPasswordReset(user.email, {
      customerName: user.fullName,
      resetToken: rawToken,
    });
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    throw new AppError(
      "Password reset token is invalid or has expired",
      400,
      "INVALID_RESET_TOKEN"
    );
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};