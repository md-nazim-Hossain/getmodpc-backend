import z from "zod";
import { PageType } from "../types";

const createPageSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    is_active: z.boolean().default(true),
    external_link: z.string().optional(),
    is_open_new_tab: z.boolean().default(false),
    page_type: z
      .enum(Object.values(PageType) as [string, ...string[]])
      .default(PageType.INTERNAL),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
  }),
});

const updatePageSchema = z.object({
  body: z.object({
    page_name: z.string().optional(),
    content: z.string().optional(),
    is_active: z.boolean().optional(),
    external_link: z.string().optional(),
    is_open_new_tab: z.boolean().optional(),
    page_type: z
      .enum(Object.values(PageType) as [string, ...string[]])
      .optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
  }),
});

export const PageValidation = {
  createPageSchema,
  updatePageSchema,
};
