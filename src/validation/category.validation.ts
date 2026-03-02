import z from "zod";

const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(255, "Name is too long"),

    description: z.string().max(1000).optional().nullable(),

    parent_cat_id: z
      .string()
      .uuid("Invalid parent category ID")
      .optional()
      .nullable(),

    category_icon: z
      .string()
      .url("Category icon must be a valid URL")
      .optional()
      .nullable(),

    category_bg_color: z
      .string()
      .regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color")
      .optional()
      .nullable(),

    category_icon_bg_color: z
      .string()
      .regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color")
      .optional()
      .nullable(),
  }),
});

const updateCategorySchema = z
  .object({
    body: createCategorySchema.shape.body,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const CategoryValidation = {
  createCategorySchema,
  updateCategorySchema,
};
