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
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: T;
};

export type IPaginationOptions = {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
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
  page_name?: string;
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
  type?: EnumPlatformType;
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
