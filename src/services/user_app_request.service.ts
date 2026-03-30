import { AppDataSource } from "../config/db";
import { UserAppRequestConstant } from "../const/user_app_request.const";
import { UserAppRequest } from "../models/user_app_request.model";
import {
  IGenericResponse,
  IPaginationOptions,
  IUserAppRequestFilters,
} from "../types";
import ApiError from "../utils/ApiError";
import {
  calculatePagination,
  calculatePaginationMeta,
} from "../utils/pagination";
import httpStatusCodes from "http-status-codes";

export class UserAppRequestService {
  private readonly userAppRequestRepository =
    AppDataSource.getRepository(UserAppRequest);

  async getAllUserAppRequests(
    filters: IUserAppRequestFilters,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<UserAppRequest[]>> {
    const { searchTerm, ...filtersData } = filters;

    const { page, limit, skip, sort_by, sort_order } =
      calculatePagination(paginationOptions);

    const query =
      this.userAppRequestRepository.createQueryBuilder("user_app_request");

    if (searchTerm) {
      const searchConditions =
        UserAppRequestConstant.userAppRequestSearchFields.map(
          (field) => `user_app_request.${field} ILIKE :search`,
        );
      query.andWhere(`(${searchConditions.join(" OR ")})`, {
        search: `%${searchTerm}%`,
      });
    }

    Object.keys(filtersData).forEach((key) => {
      query.andWhere(`user_app_request.${key} = :${key}`, {
        [key]: (filtersData as any)[key],
      });
    });

    const total = await query.getCount();
    query.orderBy(`user_app_request.${sort_by}`, sort_order as "ASC" | "DESC");
    query.skip(skip).take(limit);

    const data = await query.getMany();

    const meta = calculatePaginationMeta(total, page, limit);

    return {
      meta,
      data,
    };
  }

  async getUserAppRequestById(id: string): Promise<UserAppRequest> {
    const userAppRequest = await this.userAppRequestRepository.findOneBy({
      id,
    });
    if (!userAppRequest) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "UserAppRequest not found");
    }
    return userAppRequest;
  }

  async createUserAppRequest(
    userAppRequest: UserAppRequest,
  ): Promise<UserAppRequest> {
    const createdUserAppRequest =
      this.userAppRequestRepository.create(userAppRequest);
    return await this.userAppRequestRepository.save(createdUserAppRequest);
  }

  async updateUserAppRequest(
    id: string,
    userAppRequest: UserAppRequest,
  ): Promise<UserAppRequest> {
    const existingUserAppRequest =
      await this.userAppRequestRepository.findOneBy({ id });
    if (!existingUserAppRequest) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "UserAppRequest not found");
    }
    this.userAppRequestRepository.merge(existingUserAppRequest, userAppRequest);
    return await this.userAppRequestRepository.save(existingUserAppRequest);
  }

  async deleteUserAppRequest(id: string): Promise<void> {
    const userAppRequest = await this.userAppRequestRepository.findOneBy({
      id,
    });
    if (!userAppRequest) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "UserAppRequest not found");
    }
    await this.userAppRequestRepository.remove(userAppRequest);
  }
}
