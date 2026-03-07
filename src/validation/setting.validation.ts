import { z } from "zod";

const createSettingSchema = z.object({
  body: z.object({
    key: z.string().min(2, "Key is required"),
    value: z.record(z.any()),
  }),
});

export const SettingValidation = {
  createSettingSchema,
};
