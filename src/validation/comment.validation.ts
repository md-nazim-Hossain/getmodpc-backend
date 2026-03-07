import z from "zod";

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Content is required"),
    app_id: z.string().min(1, "App id is required").uuid("Invalid app id"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email().min(1, "Email is required"),
  }),
});

const replayCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Content is required"),
    parentId: z.string().min(1, "Parent Comment ID is required"),
    app_id: z.string().min(1, "App id is required").uuid("Invalid app id"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email().min(1, "Email is required"),
  }),
});

const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Content is required"),
  }),
})

export const CommentValidation = {
  createCommentSchema,
  replayCommentSchema,
  updateCommentSchema
};
