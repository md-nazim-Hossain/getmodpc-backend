import z from "zod";

export const createContactSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email().min(1, "Email is required"),
    message: z.string().optional(),
  }),
});

const updateContactSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    message: z.string().optional(),
  }),
});

export const ContactValidation = {
  createContactSchema,
  updateContactSchema,
};
