import { In } from "typeorm";
import { AppDataSource } from "../config/db";
import { ReportConstant } from "../const/report.const";
import { ReportReason } from "../models/report_reason";
import {
  IGenericResponse,
  IPaginationOptions,
  IReportReasonFilters,
} from "../types";
import ApiError from "../utils/ApiError";
import {
  calculatePagination,
  calculatePaginationMeta,
} from "../utils/pagination";
import httpStatusCodes from "http-status-codes";

export class ReportReasonService {
  private readonly reportReasonRepository =
    AppDataSource.getRepository(ReportReason);

  async getAllReportReasons(
    filters: IReportReasonFilters,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<ReportReason[]>> {
    const { searchTerm, ...filtersData } = filters;

    const { page, limit, skip, sort_by, sort_order } =
      calculatePagination(paginationOptions);

    const query =
      this.reportReasonRepository.createQueryBuilder("report_reason");

    if (searchTerm) {
      const searchConditions = ReportConstant.reportReasonSearchFields.map(
        (field) => `report_reason.${field} ILIKE :search`,
      );
      query.andWhere(`(${searchConditions.join(" OR ")})`, {
        search: `%${searchTerm}%`,
      });
    }

    Object.keys(filtersData).forEach((key) => {
      query.andWhere(`report_reason.${key} = :${key}`, {
        [key]: (filtersData as any)[key],
      });
    });

    const total = await query.getCount();
    query.orderBy(`report_reason.${sort_by}`, sort_order as "ASC" | "DESC");
    query.skip(skip).take(limit);

    const data = await query.getMany();

    const meta = calculatePaginationMeta(total, page, limit);

    return {
      data,
      meta,
    };
  }

  async getAllActiveReportReasons(): Promise<ReportReason[]> {
    return await this.reportReasonRepository.find({
      where: { is_active: true },
    });
  }

  async getReportReasonById(id: string): Promise<ReportReason> {
    const reportReason = await this.reportReasonRepository.findOneBy({ id });
    if (!reportReason) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Report reason not found");
    }
    return reportReason;
  }

  async createReportReason(reportReason: ReportReason): Promise<ReportReason> {
    const create = this.reportReasonRepository.create(reportReason);
    return await this.reportReasonRepository.save(create);
  }

  async updateReportReason(
    id: string,
    reportReason: ReportReason,
  ): Promise<ReportReason> {
    const update = await this.reportReasonRepository.findOneBy({ id });
    if (!update) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Report reason not found");
    }
    Object.assign(update, reportReason);
    return await this.reportReasonRepository.save(update);
  }

  async deleteReportReason(id: string): Promise<ReportReason> {
    const reportReason = await this.reportReasonRepository.findOneBy({ id });
    if (!reportReason) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Report reason not found");
    }
    return await this.reportReasonRepository.remove(reportReason);
  }

  async deleteMultipleReportReason(ids: string[]): Promise<void> {
    await this.reportReasonRepository.delete({ id: In(ids) });
  }
}
