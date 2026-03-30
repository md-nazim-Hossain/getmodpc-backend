import z from "zod";

const deleteMultipleItemSchema = z.object({
  body: z
    .object({
      ids: z.array(z.string().uuid("Invalid report reason ID")),
    })
    .refine((data) => data.ids.length > 0, {
      message: "At least one report reason ID must be provided",
    }),
});

export const IndexValidation = {
  deleteMultipleItemSchema,
};
