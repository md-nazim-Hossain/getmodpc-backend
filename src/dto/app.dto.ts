import { AppLink } from "../models/app_link.model";
import {
  EnumAppCommentStatus,
  EnumAppStatus,
  EnumAppType,
  EnumPlatformType,
} from "../types";

export type CreateAppDTO = {
  name: string;
  platform?: EnumPlatformType | null;
  type?: EnumAppType | null;
  description: string;
  summary?: string | null;
  latest_news?: string | null;
  header_image?: string | null;
  icon?: string | null;
  genre?: string | null;
  youtube_id?: string | null;
  os_version: string;
  screenshots?: string[];
  app_developers?: string[];
  app_tags?: string[];
  version?: string | null;
  latest_version?: string | null;
  show_in_slider?: boolean;
  updated?: string | null;
  status?: EnumAppStatus;
  comment_status?: EnumAppCommentStatus;
  categories?: string[];
  tags?: string[];
  url: string;
  package_name: string;
  installs: string;
  score_text: string;
  ratings?: number;
  reviews?: number;
  published_date?: string | null;
  links?: AppLink[];
  size?: string | null;
  short_mode?: string | null;
  is_verified?: boolean;
  modders?: {
    title?: string | null;
    descriptions?: string | null;
  }[];
  last_version_checked_at?: string | null;
};

export type UpdateAppDTO = Partial<CreateAppDTO> & {
  id: string;
  slug: string;
};
