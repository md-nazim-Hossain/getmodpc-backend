import { AppDataSource } from "../config/db";
import { Admin } from "../models/admin.model";
import ApiError from "../utils/ApiError";
import httpStatusCodes from "http-status-codes";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/generateTokens";
import { errorLogger } from "../utils/logger";

export class AdminAuthService {
  private adminRepository = AppDataSource.getRepository(Admin);
  public async loginAdmin(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string; admin: Admin }> {
    const admin = await this.adminRepository.findOne({
      where: { email },
      select: ["id", "email", "password", "is_active", "avatar", "full_name"],
    });
    if (!admin) {
      throw new ApiError(
        httpStatusCodes.UNAUTHORIZED,
        "Admin not found with this email",
      );
    }

    if (!admin.is_active) {
      throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Admin is not active");
    }

    const isPasswordMatch = await admin.comparePassword(password);
    if (!isPasswordMatch) {
      throw new ApiError(
        httpStatusCodes.UNAUTHORIZED,
        "Invalid email or password",
      );
    }

    try {
      admin.last_login_at = new Date();
      await this.adminRepository.save(admin);
    } catch (err) {
      errorLogger.log("Failed to update last_login_at", err);
    }

    const { password: _, ...adminWithoutPassword } = admin;

    return {
      admin: adminWithoutPassword as Admin,
      accessToken: generateAccessToken(admin.id),
      refreshToken: generateRefreshToken(admin.id),
    };
  }

  public async adminRefreshToken(
    token: string,
  ): Promise<{ accessToken: string }> {
    try {
      const decoded = verifyRefreshToken(token);
      const admin = await this.adminRepository.findOne({
        where: { id: decoded.userId },
      });
      if (!admin) {
        throw new ApiError(
          httpStatusCodes.UNAUTHORIZED,
          "Invalid refresh token",
        );
      }
      const accessToken = generateAccessToken(admin.id);
      return { accessToken };
    } catch (error) {
      throw new ApiError(httpStatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }
  }

  public async adminForgotPassword(email: string): Promise<void> {
    const admin = await this.adminRepository.findOne({ where: { email } });
    if (!admin) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "User not found");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.password_reset_otp = otp;
    admin.password_reset_otp_expires = new Date(Date.now() + 10 * 60 * 1000);

    await this.adminRepository.save(admin);
    console.log(`Password reset OTP for ${email}: ${otp}`);
  }

  public async adminResetPassword(
    otp: string,
    password: string,
  ): Promise<void> {
    const admin = await this.adminRepository.findOne({
      where: {
        password_reset_otp: otp,
      },
    });

    if (!admin) {
      throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid OTP");
    }

    if (
      admin?.password_reset_otp_expires &&
      admin?.password_reset_otp_expires < new Date()
    ) {
      throw new ApiError(httpStatusCodes.BAD_REQUEST, "OTP has expired");
    }

    await admin.setPassword(password);
    admin.password_reset_otp = null;
    admin.password_reset_otp_expires = null;
    await this.adminRepository.save(admin);
  }

  public async changeAdminPassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const admin = await this.adminRepository.findOne({ where: { id: userId } });
    if (!admin) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "User not found");
    }

    const isPasswordMatch = await admin.comparePassword(oldPassword);
    if (!isPasswordMatch) {
      throw new ApiError(
        httpStatusCodes.UNAUTHORIZED,
        "Incorrect old password",
      );
    }

    await admin.setPassword(newPassword);
    await this.adminRepository.save(admin);
  }

  async getMyProfile(id: string) {
    return await this.adminRepository
      .createQueryBuilder("admin")
      .select([
        "admin.id",
        "admin.full_name",
        "admin.email",
        "admin.avatar",
        "admin.is_active",
      ])
      .where("admin.id = :id", { id })
      .getOne();
  }
}
