import { App } from "../models/app.model";
import { AppLink } from "../models/app_link.model";
import { Category } from "../models/category.model";
import { FAQs } from "../models/faq.model";

export type IGenericErrorMessage = {
  path: string;
  message: string;
};

export type IGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorMessages: IGenericErrorMessage[];
};

export type IGenericResponse<T> = {
  meta: IPaginationMeta;
  data: T;
};

export type IPaginationOptions = {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
};

export type IPaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ICategoryFilters = {
  searchTerm?: string;
  slug?: boolean;
  name?: string;
  description?: string;
  parent_cat_id?: string | null;
};

export type IPageFilters = {
  searchTerm?: string;
  is_active?: boolean;
  slug?: string;
  title?: string;
  external_link?: string;
  page_type?: PageType;
};

export enum PageType {
  INTERNAL = "internal",
  EXTERNAL = "external",
}

export type IAdminFilters = {
  searchTerm?: string;
  email?: string;
  is_active?: boolean;
  full_name?: string;
};

export type ITagAndDeveloperFilters = {
  searchTerm?: string;
  slug?: boolean;
  name?: string;
  description?: string;
};

export interface SlugEntity {
  id: string | number;
  slug: string;
}

export type ITestimonialFilters = {
  searchTerm?: string;
  designation?: boolean;
  name?: string;
  content?: string;
  is_active?: boolean;
  sort_order?: number;
};

export type IFAQsFilters = {
  searchTerm?: string;
  title?: string;
  content?: string;
  platform?: EnumPlatformType;
};

export type IUserAppRequestFilters = {
  searchTerm?: string;
  app_name?: string;
  app_url?: string;
  status?: EnumUserAppRequestStatus;
};

export type IReportReasonFilters = {
  searchTerm?: string;
  is_active?: boolean;
};

export type IReportFilters = {
  searchTerm?: string;
  status?: EnumReportStatus;
  email?: string;
  reason?: string;
};

export type IAdFilters = {
  searchTerm?: string;
  media_type?: EnumMediaType;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
};

export type ICommentFilters = {
  searchTerm?: string;
  app_id?: string;
};

export type IContactFilters = {
  searchTerm?: string;
  email?: string;
};

export type ICheckAppVersionResponse = {
  update_available: boolean;
  current_version: string;
  new_version: string;
  last_checked: Date;
};

export type IAppFilters = {
  searchTerm?: string;
  platform?: EnumPlatformType;
  type?: EnumAppType;
  status?: EnumAppStatus;
  category?: string;
  date?: string;
  only_deleted?: boolean;
  is_verified?: boolean;
};

export type IAppResponseDTO = Omit<App, "links"> & {
  links: Array<Omit<AppLink, "app">>;
  related?: {
    byCategory: IHomePageApp[];
    similar: IHomePageApp[];
    sameDeveloper: IHomePageApp[];
  };
};

export type IAppDownloadPageResponseDTO = Omit<App, "links"> & {
  links: Array<Omit<AppLink, "app">>;
  related?: {
    byCategory: IHomePageApp[];
    downloadFaqs: FAQs[];
  };
};

export type IHomePageApp = {
  icon: string | null;
  header_image: string | null;
  id: string;
  name: string;
  slug: string;
  is_verified: boolean;
  type: EnumAppType | null;
  platform: EnumPlatformType | null;
  size: string | null;
  os_version: string | null;
  short_mode: string | null;
  version: string | null;
  updated_at: Date | string;
};
export type IHomePageAppResponse = {
  sliderApps: IHomePageApp[];
  popularApps: IHomePageApp[];
  popularGames: IHomePageApp[];
  latestUpdatedApps: IHomePageApp[];
  latestUpdatedGames: IHomePageApp[];
  newReleasedApps: IHomePageApp[];
  newReleasedGames: IHomePageApp[];
  categories: IGroupedCategory[];
};
export type IGroupedCategory = {
  parent_id: string;
  parent_name: string;
  parent_slug: string;
  categories: Category[];
};

export type IMediaAction = {
  success: string[];
  failed: string[];
};

export type IMedia = {
  name: string;
  key: string;
  size: number;
  type: string;
  created_at: Date | null;
  url: string;
};

export type IAllMediaResponse = {
  folders: string[];
  files: IMedia[];
  nextToken?: string;
  hasMore: boolean;
};

export type ILiteApksAppsAndGames = {
  title: string;
  icon: string;
  link: string;
  scoreText: string;
  shortMode: string;
};
// ====================== ENUM =============== //
export enum EnumPlatformType {
  ANDROID = "android",
  APPLE = "apple",
  WINDOWS = "windows",
}

export enum EnumAppType {
  APP = "app",
  GAME = "game",
}

export enum EnumUserAppRequestStatus {
  PENDING = "pending",
  DECLINED = "declined",
  RESOLVED = "resolved",
}

export enum EnumReportStatus {
  DECLINED = "declined",
  CLOSED = "closed",
  OPEN = "open",
}

export enum EnumMediaType {
  IMAGE = "image",
  VIDEO = "video",
}

export enum EnumAppStatus {
  PUBLISH = "publish",
  DRAFT = "draft",
}

export enum EnumAppCommentStatus {
  OPEN = "open",
  CLOSED = "closed",
}

export enum EnumLiteApkType {
  APPS = "apps",
  GAMES = "games",
}

export enum EnumAppSource {
  PLAY_STORE = "play_store",
  LITE_APKS = "lite_apks",
}
