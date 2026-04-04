import z from "zod";
import {
  EnumAppCommentStatus,
  EnumAppSource,
  EnumAppStatus,
  EnumAppType,
  EnumPlatformType,
} from "../types";

const getAppScrapingSchema = z.object({
  body: z.object({
    url: z.string().min(1, "Url is required").url("Invalid url"),
  }),
});

const checkAppVersionSchema = z.object({
  body: z.object({
    appId: z.string().min(1, "App id is required"),
    currentVersion: z.string().min(1, "Current version is required"),
  }),
});

const appLinkSchema = z.object({
  name: z.string(),
  link: z.string().url("Invalid link"),
  type: z.string().optional(),
  size: z.string().optional(),
  note: z.string().optional(),
});
const createAppSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(255),
    title: z.string().optional(),
    platform: z.nativeEnum(EnumPlatformType).optional().nullable(),
    type: z.nativeEnum(EnumAppType).optional().nullable(),
    source: z.nativeEnum(EnumAppSource, {
      required_error: "Source is required",
    }),
    description: z.string().min(2, "Description must be at least 2 characters"),
    summary: z.string().optional().nullable(),
    latest_news: z.string().optional().nullable(),
    header_image: z.string().optional().nullable(),
    icon: z.string().optional().nullable(),
    genre: z.string().optional().nullable(),
    youtube_id: z.string().optional().nullable(),
    os_version: z.string().min(2, "OS version is required"),
    screenshots: z.array(z.string()).optional(),
    developer: z.string().min(2, "Developer is required"),
    app_tags: z.array(z.string()).optional(),
    app_developers: z.array(z.string()).optional(),
    version: z.string().optional().nullable(),
    latest_version: z.string().optional().nullable(),
    show_in_slider: z.boolean().optional(),
    updated: z.string().optional().nullable(),
    status: z.nativeEnum(EnumAppStatus).optional(),
    comment_status: z.nativeEnum(EnumAppCommentStatus).optional(),
    categories: z.array(z.string().uuid("Invalid category ID")).optional(), // array of category IDs
    tags: z.array(z.string().uuid("Invalid tag ID")).optional(), // array of tag IDs
    url: z.string(),
    package_name: z.string(),
    installs: z.string(),
    score_text: z.string(),
    ratings: z.number().int().optional(),
    reviews: z.number().int().optional(),
    published_date: z.string().optional().nullable(),
    size: z.string().optional().nullable(),
    is_verified: z.boolean().optional(),
    short_mode: z.string().optional(),
    links: z.array(appLinkSchema).optional(),
    modders: z
      .array(
        z.object({
          title: z.string().optional().nullable(),
          descriptions: z.string().optional().nullable(),
        }),
      )
      .optional(),
    last_version_checked_at: z.string().optional().nullable(),
  }),
});

const updateAppSchema = z.object({
  body: z
    .object({
      name: z.string().optional(),
      title: z.string().optional(),
      slug: z.string().optional(),
      platform: z.nativeEnum(EnumPlatformType).optional().nullable(),
      type: z.nativeEnum(EnumAppType).optional().nullable(),
      source: z.nativeEnum(EnumAppSource).optional(),
      description: z.string().optional(),
      summary: z.string().optional().nullable(),
      latest_news: z.string().optional().nullable(),
      header_image: z.string().optional().nullable(),
      icon: z.string().optional().nullable(),
      genre: z.string().optional().nullable(),
      youtube_id: z.string().optional().nullable(),
      os_version: z.string().optional(),
      size: z.string().optional().nullable(),
      screenshots: z.array(z.string()).optional(),
      developer: z.string().optional(),
      app_tags: z.array(z.string()).optional(),
      app_developers: z.array(z.string()).optional(),
      version: z.string().optional().nullable(),
      latest_version: z.string().optional().nullable(),
      show_in_slider: z.boolean().optional(),
      updated: z.string().optional().nullable(),
      status: z.nativeEnum(EnumAppStatus).optional(),
      comment_status: z.nativeEnum(EnumAppCommentStatus).optional(),
      categories: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      url: z.string().optional(),
      package_name: z.string().optional(),
      installs: z.string().optional(),
      score_text: z.string().optional(),
      ratings: z.number().int().optional(),
      reviews: z.number().int().optional(),
      published_date: z.string().optional().nullable(),
      links: z.array(appLinkSchema).optional(),
      is_verified: z.boolean().optional(),
      short_mode: z.string().optional(),
      modders: z
        .array(
          z.object({
            title: z.string().optional().nullable(),
            descriptions: z.string().optional().nullable(),
          }),
        )
        .optional(),
      last_version_checked_at: z.string().optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be updated",
      path: ["body"],
    }),
});

export const AppValidation = {
  checkAppVersionSchema,
  getAppScrapingSchema,
  createAppSchema,
  updateAppSchema,
};
