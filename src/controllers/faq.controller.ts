import { Request, Response } from "express";
import { FaqService } from "../services/faq.service";
import { catchAsync } from "../utils/catchAsync";
import pick from "../utils/pick";
import { FAQsConstant } from "../const/faq.const";
import { EnumPlatformType, IPaginationOptions } from "../types";
import { paginationFields } from "../const/pagination.const";
import sendResponse from "../utils/ApiResponse";
import { FAQs } from "../models/faq.model";
import httpStatusCodes from "http-status-codes";

export class FaqController {
  private readonly faqService = new FaqService();

  public getAllFAQs = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, FAQsConstant.faqFiltersFields);
    const paginationOptions: IPaginationOptions = pick(
      req.query,
      paginationFields,
    );
    const faqs = await this.faqService.getAllFAQs(filters, paginationOptions);
    sendResponse<FAQs[]>(res, {
      message: "FAQs fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: faqs.data,
      meta: faqs.meta,
      success: true,
    });
  });

  public getFaqByType = catchAsync(async (req: Request, res: Response) => {
    const faqs = await this.faqService.getFaqByType(
      req.params.type as EnumPlatformType,
    );
    sendResponse<FAQs[]>(res, {
      message: "FAQs fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: faqs,
      success: true,
    });
  });

  public getFaqById = catchAsync(async (req: Request, res: Response) => {
    const faq = await this.faqService.getFaqById(req.params.id);
    sendResponse<FAQs>(res, {
      message: "Faq fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: faq,
      success: true,
    });
  });

  public createFaq = catchAsync(async (req: Request, res: Response) => {
    const faq = await this.faqService.createFaq(req.body);
    sendResponse<FAQs>(res, {
      message: "Faq created successfully",
      statusCode: httpStatusCodes.CREATED,
      data: faq,
      success: true,
    });
  });

  public updateFaq = catchAsync(async (req: Request, res: Response) => {
    const faq = await this.faqService.updateFaq(req.params.id, req.body);
    sendResponse<FAQs>(res, {
      message: "Faq updated successfully",
      statusCode: httpStatusCodes.OK,
      data: faq,
      success: true,
    });
  });

  public deleteFaq = catchAsync(async (req: Request, res: Response) => {
    const faq = await this.faqService.deleteFaq(req.params.id);
    sendResponse<FAQs>(res, {
      message: "Faq deleted successfully",
      statusCode: httpStatusCodes.OK,
      data: faq,
      success: true,
    });
  });
}
