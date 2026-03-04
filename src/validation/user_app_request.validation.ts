import z from "zod";
import { EnumUserAppRequestStatus } from "../types";

const createUserAppRequest = z.object({
  body: z.object({
    app_name: z.string().min(2, "App name must be at least 2 characters"),
    app_url: z
      .string()
      .url("App URL must be a valid URL")
      .min(2, "App URL is required"),
  }),
});

const updateUserAppRequest = z.object({
  body: z
    .object({
      app_name: z.string().optional(),
      app_url: z.string().url("App URL must be a valid URL").optional(),
      status: z
        .enum(Object.values(EnumUserAppRequestStatus) as [string, ...string[]])
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be updated",
    }),
});

export const UserAppRequestValidation = {
  createUserAppRequest,
  updateUserAppRequest,
};
