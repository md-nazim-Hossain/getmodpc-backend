import { IPaginationMeta, IPaginationOptions } from "../types";

type IOptionsResult = Required<IPaginationOptions> & {
  skip: number;
};
export const calculatePagination = (
  options: IPaginationOptions,
): IOptionsResult => {
  const page = +(options.page || 1);
  const limit = +(options.limit || 20);
  const skip = (page - 1) * limit;

  const sort_by = options?.sort_by || "created_at";
  const sort_order = options?.sort_order || "DESC";

  return {
    page,
    limit,
    skip,
    sort_by,
    sort_order,
  };
};

export const calculatePaginationMeta = (
  total: number,
  page: number,
  limit: number,
): IPaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};
