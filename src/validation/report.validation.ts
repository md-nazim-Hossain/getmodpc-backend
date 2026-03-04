import z from "zod";
import { EnumReportStatus } from "../types";

const createReportReasonSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Reason is required"),
    is_active: z.boolean().default(true),
  }),
});

const createReportSchema = z.object({
  body: z.object({
    email: z.string().email().min(1, "Email is required"),
    reason: z.string().min(1, "Reason is required").uuid("Invalid reason ID"),
    details: z.string().optional(),
    status: z
      .enum(Object.values(EnumReportStatus) as [string, ...string[]])
      .default(EnumReportStatus.OPEN),
  }),
});

const updateReportSchema = z.object({
  body: z
    .object({
      email: z.string().email().optional(),
      reason: z.string().uuid("Invalid reason ID").optional(),
      details: z.string().optional(),
      status: z
        .enum(Object.values(EnumReportStatus) as [string, ...string[]])
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be updated",
    }),
});

const updateReportReasonSchema = z.object({
  body: z
    .object({
      title: z.string().optional(),
      is_active: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be updated",
    }),
});

export const ReportValidation = {
  createReportReasonSchema,
  updateReportReasonSchema,
  createReportSchema,
  updateReportSchema,
};
