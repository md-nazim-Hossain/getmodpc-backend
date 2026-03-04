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
  type?: EnumType;
};

export type IUserAppRequestFilters = {
  searchTerm?: string;
  app_name?: string;
  app_url?: string;
  status?: EnumUserAppRequestStatus;
};

// ====================== ENUM =============== //
export enum EnumType {
  ANDROID = "android",
  APPLE = "apple",
  WINDOWS = "windows",
}

export enum EnumUserAppRequestStatus {
  PENDING = "pending",
  DECLINED = "declined",
  RESOLVED = "resolved",
}
