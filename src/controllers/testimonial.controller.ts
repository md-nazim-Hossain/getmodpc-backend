import { Request, Response } from "express";
import { TestimonialService } from "../services/testimonial.service";
import pick from "../utils/pick";
import { TestimonialConstant } from "../const/testimonial.const";
import { catchAsync } from "../utils/catchAsync";
import { IPaginationOptions } from "../types";
import { paginationFields } from "../const/pagination.const";
import sendResponse from "../utils/ApiResponse";
import { Testimonial } from "../models/testimonial.model";
import httpStatusCodes from "http-status-codes";

export class TestimonialController {
  private testimonialService = new TestimonialService();

  public getAllTestimonials = catchAsync(
    async (req: Request, res: Response) => {
      const filters = pick(
        req.query,
        TestimonialConstant.testimonialFiltersFields,
      );
      const paginationOptions: IPaginationOptions = pick(
        req.query,
        paginationFields,
      );
      const testimonials = await this.testimonialService.getAllTestimonials(
        filters,
        paginationOptions,
      );
      sendResponse<Testimonial[]>(res, {
        message: "Testimonials fetched successfully",
        statusCode: httpStatusCodes.OK,
        data: testimonials.data,
        meta: testimonials.meta,
        success: true,
      });
    },
  );

  public getAllActiveTestimonials = catchAsync(
    async (req: Request, res: Response) => {
      const testimonials =
        await this.testimonialService.getAllActiveTestimonials();
      sendResponse<Testimonial[]>(res, {
        message: "Testimonials fetched successfully",
        statusCode: httpStatusCodes.OK,
        data: testimonials,
        success: true,
      });
    },
  );
  public getTestimonialById = catchAsync(
    async (req: Request, res: Response) => {
      const testimonial = await this.testimonialService.getTestimonialById(
        req.params.id,
      );
      sendResponse<Testimonial>(res, {
        message: "Testimonial fetched successfully",
        statusCode: httpStatusCodes.OK,
        data: testimonial,
        success: true,
      });
    },
  );

  public createTestimonial = catchAsync(async (req: Request, res: Response) => {
    const testimonial = await this.testimonialService.createTestimonial(
      req.body,
    );
    sendResponse<Testimonial>(res, {
      message: "Testimonial created successfully",
      statusCode: httpStatusCodes.CREATED,
      data: testimonial,
      success: true,
    });
  });

  public updateTestimonial = catchAsync(async (req: Request, res: Response) => {
    const testimonial = await this.testimonialService.updateTestimonial(
      req.params.id,
      req.body,
    );
    sendResponse<Testimonial>(res, {
      message: "Testimonial updated successfully",
      statusCode: httpStatusCodes.OK,
      data: testimonial,
      success: true,
    });
  });

  public deleteTestimonial = catchAsync(async (req: Request, res: Response) => {
    const testimonial = await this.testimonialService.deleteTestimonial(
      req.params.id,
    );
    sendResponse<Testimonial>(res, {
      message: "Testimonial deleted successfully",
      statusCode: httpStatusCodes.OK,
      data: testimonial,
      success: true,
    });
  });
}
