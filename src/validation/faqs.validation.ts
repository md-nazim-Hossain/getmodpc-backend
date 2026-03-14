import z from "zod";
import { EnumPlatformType } from "../types";

const createFaqSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    type: z
      .enum(Object.values(EnumPlatformType) as [string, ...string[]])
      .default(EnumPlatformType.ANDROID),
  }),
});

const updateFaqSchema = createFaqSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const FaqValidation = {
  createFaqSchema,
  updateFaqSchema,
};
