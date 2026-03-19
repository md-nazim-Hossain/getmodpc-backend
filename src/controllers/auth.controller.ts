import { Request, Response } from "express";
import { AdminAuthService } from "../services/auth.service";
import { catchAsync } from "../utils/catchAsync";
import sendResponse from "../utils/ApiResponse";
import httpStatusCodes from "http-status-codes";
import { Admin } from "../models/admin.model";
export class AdminAuthController {
  private adminService = new AdminAuthService();

  public loginAdmin = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { accessToken, refreshToken, admin } =
      await this.adminService.loginAdmin(email, password);
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      domain: isProd ? ".vercel.app" : "localhost",
      path: "/",
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      domain: isProd ? ".vercel.app" : "localhost",
      path: "/",
    });
    sendResponse<{ accessToken: string; refreshToken: string; admin: Admin }>(
      res,
      {
        success: true,
        data: { accessToken, refreshToken, admin },
        statusCode: httpStatusCodes.OK,
        message: "Admin logged in successfully",
      },
    );
  });

  public changeAdminPassword = catchAsync(
    async (req: Request, res: Response) => {
      const { oldPassword, newPassword } = req.body;
      await this.adminService.changeAdminPassword(
        req?.admin?.id as string,
        oldPassword,
        newPassword,
      );
      sendResponse(res, {
        success: true,
        message: "Password changed successfully",
        statusCode: httpStatusCodes.OK,
      });
    },
  );

  public adminRefreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const { accessToken } =
      await this.adminService.adminRefreshToken(refreshToken);
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      domain: isProd ? ".vercel.app" : "localhost",
      path: "/",
    });
    sendResponse<{ accessToken: string }>(res, {
      success: true,
      data: { accessToken },
      statusCode: httpStatusCodes.OK,
    });
  });

  public adminForgetPassword = catchAsync(
    async (req: Request, res: Response) => {
      const { email } = req.body;
      await this.adminService.adminForgotPassword(email);
      sendResponse(res, {
        success: true,
        message: "Email sent successfully",
        statusCode: httpStatusCodes.OK,
      });
    },
  );

  public adminResetPassword = catchAsync(
    async (req: Request, res: Response) => {
      const { otp, password } = req.body;
      await this.adminService.adminResetPassword(otp, password);
      sendResponse(res, {
        success: true,
        message: "Password reset successfully",
        statusCode: httpStatusCodes.OK,
      });
    },
  );

  public logoutAdmin = catchAsync(async (req: Request, res: Response) => {
    res.clearCookie("accessToken", { expires: new Date(0) });
    res.clearCookie("refreshToken", { expires: new Date(0) });
    sendResponse(res, {
      success: true,
      message: "Logout successfully",
      statusCode: httpStatusCodes.OK,
    });
  });

  public getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const admin = await this.adminService.getMyProfile(
      req?.admin?.id as string,
    );
    sendResponse<Admin>(res, {
      success: true,
      message: "Profile fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: admin,
    });
  });
}
