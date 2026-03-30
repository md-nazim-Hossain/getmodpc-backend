import { In } from "typeorm";
import { AppDataSource } from "../config/db";
import { AdminConstant } from "../const/admin.const";
import { Admin } from "../models/admin.model";
import { IAdminFilters, IGenericResponse, IPaginationOptions } from "../types";
import ApiError from "../utils/ApiError";
import {
  calculatePagination,
  calculatePaginationMeta,
} from "../utils/pagination";
import httpStatusCodes from "http-status-codes";
export class AdminService {
  private adminRepository = AppDataSource.getRepository(Admin);
  async getAllAdminUsers(
    filters: IAdminFilters,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<Admin[]>> {
    const { searchTerm, ...filtersData } = filters;
    const { page, limit, skip, sort_by, sort_order } =
      calculatePagination(paginationOptions);
    const query = this.adminRepository.createQueryBuilder("admin");
    // Apply search
    if (searchTerm) {
      const searchConditions = AdminConstant.adminSearchFields.map(
        (field) => `admin.${field} ILIKE :search`,
      );
      query.andWhere(`(${searchConditions.join(" OR ")})`, {
        search: `%${searchTerm}%`,
      });
    }

    Object.keys(filtersData).forEach((key) => {
      query.andWhere(`admin.${key} = :${key}`, {
        [key]: (filtersData as any)[key],
      });
    });

    const total = await query.getCount();
    query.orderBy(`admin.${sort_by}`, sort_order as "ASC" | "DESC");
    query.skip(skip).take(limit);

    const data = await query.getMany();

    const meta = calculatePaginationMeta(total, page, limit);

    return {
      meta,
      data,
    };
  }

  async getAdminUserById(id: string) {
    return await this.adminRepository.findOneBy({ id });
  }

  async createAdminUser(admin: Partial<Admin>): Promise<Admin> {
    const addNewAdmin = this.adminRepository.create(admin);
    const savedAdmin = await this.adminRepository.save(addNewAdmin);
    const { password, ...rest } = savedAdmin;
    return rest as Admin;
  }

  public async updateAdminUser(
    adminId: string,
    payload: Partial<Admin>,
  ): Promise<Admin> {
    const admin = await this.adminRepository.findOneBy({ id: adminId });

    if (!admin) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Admin user not found");
    }

    this.adminRepository.merge(admin, payload);
    const updateAdmin = await this.adminRepository.save(admin);
    const { password, ...rest } = updateAdmin;
    return rest as Admin;
  }

  async deleteAdminUser(id: string): Promise<Admin> {
    const existingAdmin = await this.adminRepository.findOneBy({ id });
    if (!existingAdmin) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Admin user not found");
    }
    return await this.adminRepository.remove(existingAdmin);
  }

  async deleteMultipleAdminUser(ids: string[]): Promise<void> {
    await this.adminRepository.delete({ id: In(ids) });
  }
}
