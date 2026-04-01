import { Request, Response } from "express";
import { CommentService } from "../services/comment.service";
import { catchAsync } from "../utils/catchAsync";
import sendResponse from "../utils/ApiResponse";
import httpsStatusCode from "http-status-codes";
import { Comment } from "../models/comment.model";
import { IPaginationOptions } from "../types";
import pick from "../utils/pick";
import { paginationFields } from "../const/pagination.const";
export class CommentController {
  private commentService = new CommentService();

  public createComment = catchAsync(async (req: Request, res: Response) => {
    const comment = await this.commentService.createComment(req.body);
    sendResponse<Comment>(res, {
      message: "Comment created successfully",
      statusCode: httpsStatusCode.CREATED,
      data: comment,
      success: true,
    });
  });

  public replayComment = catchAsync(async (req: Request, res: Response) => {
    const comment = await this.commentService.replyComment(req.body);
    sendResponse<Comment>(res, {
      message: "Comment Replied successfully",
      statusCode: httpsStatusCode.CREATED,
      data: comment,
      success: true,
    });
  });

  public updateComment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.commentService.updateComment(id, req.body);
    sendResponse<void>(res, {
      message: "Comment updated successfully",
      statusCode: httpsStatusCode.OK,
      success: true,
    });
  });

  public deleteComment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.commentService.deleteComment(id);
    sendResponse<void>(res, {
      message: "Comment deleted successfully",
      statusCode: httpsStatusCode.OK,
      success: true,
    });
  });

  public getAllCommentsByAppId = catchAsync(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const paginationOptions: IPaginationOptions = pick(
        req.query,
        paginationFields,
      );
      const comments = await this.commentService.getAllCommentsByAppId(
        id,
        paginationOptions,
      );
      sendResponse<Comment[]>(res, {
        message: "Comments fetched successfully",
        statusCode: httpsStatusCode.OK,
        data: comments.data,
        meta: comments.meta,
        success: true,
      });
    },
  );

  public deleteMultipleComments = catchAsync(
    async (req: Request, res: Response) => {
      const { ids } = req.body;
      await this.commentService.deleteMultipleComments(ids);
      sendResponse<void>(res, {
        message: "Comments deleted successfully",
        statusCode: httpsStatusCode.OK,
        success: true,
      });
    },
  );
}
