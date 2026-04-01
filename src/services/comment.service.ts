import { AppDataSource } from "../config/db";
import { Comment } from "../models/comment.model";
import {
  EnumAppCommentStatus,
  EnumAppStatus,
  ICommentFilters,
  IGenericResponse,
  IPaginationOptions,
} from "../types";
import ApiError from "../utils/ApiError";
import httpStatusCodes from "http-status-codes";
import {
  calculatePagination,
  calculatePaginationMeta,
} from "../utils/pagination";
import { CreateCommentDTO, ReplayCommentDTO } from "../dto/comment.dto";
import { App } from "../models/app.model";

export class CommentService {
  private readonly commentRepository = AppDataSource.getRepository(Comment);
  private readonly appRepository = AppDataSource.getRepository(App);

  async createComment(payload: CreateCommentDTO): Promise<Comment> {
    const existApp = await this.appRepository.findOne({
      where: {
        id: payload.app_id,
        status: EnumAppStatus.PUBLISH,
      },
    });

    if (!existApp) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "App not found");
    }

    if (existApp.comment_status === EnumAppCommentStatus.CLOSED) {
      throw new ApiError(
        httpStatusCodes.BAD_REQUEST,
        "You can't comment on this app because comments are closed",
      );
    }

    const commentData = this.commentRepository.create({
      ...payload,
      app: { id: payload.app_id },
    });
    return await this.commentRepository.save(commentData);
  }
  async replyComment(payload: ReplayCommentDTO): Promise<Comment> {
    const parentComment = await this.commentRepository.findOne({
      where: { id: payload.parentId },
      relations: ["app"],
      select: {
        id: true,
        content: true,
        name: true,
        email: true,
        app: {
          id: true,
          name: true,
          comment_status: true,
        },
      },
    });

    if (!parentComment) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Parent comment not found");
    }

    if (parentComment.app.comment_status === EnumAppCommentStatus.CLOSED) {
      throw new ApiError(
        httpStatusCodes.BAD_REQUEST,
        "You can't comment on this app because comments are closed",
      );
    }
    const reply = this.commentRepository.create({
      ...payload,
      app: { id: parentComment.app.id },
      parent: parentComment,
      is_edited: false,
    });

    return await this.commentRepository.save(reply);
  }

  async updateComment(id: string, comment: Partial<Comment>): Promise<void> {
    const data = {
      ...comment,
      is_edited: true,
      last_edited_at: new Date(),
    };
    await this.commentRepository.update(id, data);
  }

  async getAllCommentsByAppId(
    appId: string,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<any[]>> {
    const { limit, page, skip, sort_by, sort_order } =
      calculatePagination(paginationOptions);

    const query = this.commentRepository
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.replies", "replies")
      .where("comment.app_id = :appId", {
        appId,
      })
      .orderBy(`comment.${sort_by}`, sort_order)
      .skip(skip)
      .take(limit);

    const [comments, total] = await query.getManyAndCount();

    const meta = calculatePaginationMeta(total, page, limit);

    return {
      data: comments,
      meta,
    };
  }

  async getAllComments(
    filters: ICommentFilters,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<any[]>> {
    const { searchTerm, app_id } = filters;
    const { limit, page, skip, sort_by, sort_order } =
      calculatePagination(paginationOptions);

    const query = this.commentRepository
      .createQueryBuilder("comment")
      .leftJoin("comment.app", "app")
      .addSelect(["app.id", "app.name", "app.comment_status"])
      .leftJoinAndSelect("comment.replies", "replies");

    if (app_id) {
      query.andWhere("comment.app_id = :app_id", { app_id });
    }

    if (searchTerm) {
      query.andWhere(
        "(comment.content ILIKE :search OR app.name ILIKE :search OR comment.name ILIKE :search OR comment.email ILIKE :search)",
        { search: `%${searchTerm}%` },
      );
    }

    query.orderBy(`comment.${sort_by}`, sort_order).skip(skip).take(limit);

    const [comments, total] = await query.getManyAndCount();

    const meta = calculatePaginationMeta(total, page, limit);

    return {
      data: comments,
      meta,
    };
  }

  async deleteComment(id: string): Promise<void> {
    const comment = await this.commentRepository.delete(id);
    if (comment.affected === 0) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Comment not found");
    }
  }

  async deleteMultipleComments(ids: string[]): Promise<void> {
    await this.commentRepository.delete(ids);
  }
}
