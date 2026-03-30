import { AppDataSource } from "../config/db";
import { ReportConstant } from "../const/report.const";
import { Report } from "../models/report";
import { IGenericResponse, IPaginationOptions, IReportFilters } from "../types";
import ApiError from "../utils/ApiError";
import {
  calculatePagination,
  calculatePaginationMeta,
} from "../utils/pagination";
import httpStatusCodes from "http-status-codes";

export class ReportService {
  private readonly reportRepository = AppDataSource.getRepository(Report);

  async getAllReports(
    filters: IReportFilters,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<Report[]>> {
    const { searchTerm, ...filtersData } = filters;

    const { page, limit, skip, sort_by, sort_order } =
      calculatePagination(paginationOptions);

    const query = this.reportRepository
      .createQueryBuilder("report")
      .leftJoin("report.reason", "reportReason")
      .addSelect([
        "reportReason.id",
        "reportReason.title",
        "reportReason.is_active",
      ]);

    if (searchTerm) {
      const searchConditions = ReportConstant.reportSearchFields.map(
        (field) => `report.${field} ILIKE :search`,
      );
      query.andWhere(`(${searchConditions.join(" OR ")})`, {
        search: `%${searchTerm}%`,
      });
    }

    Object.keys(filtersData).forEach((key) => {
      query.andWhere(`report.${key} = :${key}`, {
        [key]: (filtersData as any)[key],
      });
    });

    const total = await query.getCount();
    query.orderBy(`report.${sort_by}`, sort_order as "ASC" | "DESC");
    query.skip(skip).take(limit);

    const data = await query.getMany();

    const meta = calculatePaginationMeta(total, page, limit);

    return {
      data,
      meta,
    };
  }

  async getReportById(id: string): Promise<Report> {
    const report = await this.reportRepository.findOneBy({ id });
    if (!report) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Report not found");
    }
    return report;
  }

  async createReport(report: Report): Promise<Report> {
    const newReport = this.reportRepository.create(report);
    return await this.reportRepository.save(newReport);
  }

  async updateReport(id: string, report: Report): Promise<Report> {
    const update = await this.reportRepository.findOneBy({ id });
    if (!update) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Report not found");
    }
    Object.assign(update, report);
    return await this.reportRepository.save(update);
  }

  async deleteReport(id: string): Promise<Report> {
    const report = await this.reportRepository.findOneBy({ id });
    if (!report) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Report not found");
    }
    return await this.reportRepository.remove(report);
  }
}
