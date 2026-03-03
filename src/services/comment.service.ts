import { AppDataSource } from "../config/db";
import { Comment } from "../models/comment.model";
import {  IGenericResponse, IPaginationOptions } from "../types";
import ApiError from "../utils/ApiError";
import httpStatusCodes from "http-status-codes";
import { calculatePagination } from "../utils/pagination";


export class CommentService {
  private commentRepository = AppDataSource.getRepository(Comment);
  private blogRepository = AppDataSource.getRepository(Blog);
  private postRepository = AppDataSource.getRepository(Post);
  private notificationService = new NotificationService();
  async createComment(comment: CreateCommentDTO): Promise<Comment> {
    // 1️⃣ Validate target
    if (!comment.blog_id && !comment.post_id) {
      throw new ApiError(
        httpStatusCodes.UNPROCESSABLE_ENTITY,
        "Blog or post is required",
      );
    }

    let blogEntity: Blog | null = null;
    let postEntity: Post | null = null;

    // 2️⃣ Validate blog / post existence
    if (comment.blog_id) {
      blogEntity = await this.blogRepository.findOne({
        where: { id: comment.blog_id, status: BlogStatus.PUBLISHED },
      });

      if (!blogEntity) {
        throw new ApiError(httpStatusCodes.NOT_FOUND, "Blog not found");
      }
    }

    if (comment.post_id) {
      postEntity = await this.postRepository.findOne({
        where: { id: comment.post_id, is_published: true },
      });

      if (!postEntity) {
        throw new ApiError(httpStatusCodes.NOT_FOUND, "Post not found");
      }
    }

    // 3️⃣ Create comment
    const newComment = this.commentRepository.create({
      content: comment.content,
      blog: blogEntity ?? null,
      post: postEntity ?? null,
      author: { id: comment.author },
    });

    const savedComment = await this.commentRepository.save(newComment);

    const commentWithRelations = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: {
        author: {
          settings: true,
          profile: true,
        },
        blog: {
          author: true,
        },
        post: {
          owner: {
            profile: true,
          },
        },
      },
      select: {
        id: true,
        content: true,
        createdAt: true,

        post: {
          id: true,
          owner: {
            id: true,
            device_token: true,
            profile: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },

        blog: {
          id: true,
          author: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },

        author: {
          id: true,
          settings: true,
          profile: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!commentWithRelations) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Comment not found");
    }

    const isPostComment = !!commentWithRelations.post;

    if (isPostComment) {
      const title = "New Comment 💬";
      const preview =
        commentWithRelations.content.length > 80
          ? commentWithRelations.content.slice(0, 77) + "..."
          : commentWithRelations.content;

      const body = `${
        commentWithRelations.author.profile?.name ?? "Someone"
      } commented on your post: ${preview}`;
      const receiverUserId = commentWithRelations?.post?.owner.id ?? null;
      const receiverDeviceToken =
        commentWithRelations?.post?.owner.device_token ?? null;
      if (receiverUserId && receiverUserId !== commentWithRelations.author.id) {
        this.notificationService
          .sendNotification(receiverUserId, title, body, "COMMENT_CREATED", {
            commentId: commentWithRelations.id,
            postId: commentWithRelations.post?.id ?? null,
            blogId: commentWithRelations.blog?.id ?? null,
          })
          .catch(console.error);

        if (
          receiverDeviceToken &&
          commentWithRelations.author.settings?.push_notifications
        ) {
          sendPushNotification(receiverDeviceToken, title, body, {
            type: "COMMENT_CREATED",
            commentId: commentWithRelations.id,
            postId: (commentWithRelations?.post?.id ?? null) as any,
          }).catch(console.error);
        }
      }
    }
    return commentWithRelations;
  }

  async replyComment(
    authorId: string,
    parentId: string,
    content: string,
  ): Promise<Comment> {
    const parentComment = await this.commentRepository.findOne({
      where: { id: parentId },
      relations: {
        author: {
          settings: true,
          profile: true,
        },
        blog: true,
        post: {
          owner: {
            profile: true,
          },
        },
      },
      select: {
        id: true,
        content: true,

        author: {
          id: true,
          settings: true,
          device_token: true,
          profile: {
            id: true,
            name: true,
          },
        },

        blog: {
          id: true,
        },

        post: {
          id: true,
          owner: {
            id: true,
            device_token: true,
            profile: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    });

    if (!parentComment) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Parent comment not found");
    }

    // 2️⃣ Create reply
    const reply = this.commentRepository.create({
      author: { id: authorId },
      blog: parentComment.blog ?? null,
      post: parentComment.post ?? null,
      content,
      parent: parentComment,
      is_edited: false,
    });

    const savedReply = await this.commentRepository.save(reply);

    const replierName = parentComment.author.profile?.name ?? "Someone";

    const isPostComment = !!parentComment.post;

    const title = "New Reply 💬";
    const body = `${replierName} replied to your comment.`;

    const receiverUserId = parentComment.author.id;

    if (receiverUserId !== authorId) {
      this.notificationService
        .sendNotification(receiverUserId, title, body, "COMMENT_REPLIED", {
          replyId: savedReply.id,
          parentCommentId: parentComment.id,
          postId: parentComment.post?.id ?? null,
          blogId: parentComment.blog?.id ?? null,
        })
        .catch(console.error);

      if (isPostComment && parentComment.author.settings?.push_notifications) {
        const deviceToken = parentComment?.author?.device_token ?? null;

        if (deviceToken) {
          sendPushNotification(deviceToken, title, body, {
            type: "COMMENT_REPLIED",
            replyId: savedReply.id,
            parentCommentId: parentComment.id,
            postId: parentComment.post!.id,
          }).catch(console.error);
        }
      }
    }

    return savedReply;
  }

  async deleteComment(id: string): Promise<void> {
    const comment = await this.commentRepository.delete(id);
    if (comment.affected === 0) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Comment not found");
    }
  }

  async updateComment(id: string, comment: Partial<Comment>): Promise<void> {
    const data = {
      ...comment,
      is_edited: true,
      last_edited_at: new Date(),
    };
    await this.commentRepository.update(id, data);
  }

  async getAllCommentsByContentId(
    contentId: string,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<any[]>> {
    const { limit, page, skip, sortBy , sortOrder} =
      calculatePagination(paginationOptions);

    const query = this.commentRepository
      .createQueryBuilder("comment")
      .leftJoin("comment.author", "author")
      .addSelect([
        "author.id",
        "author.user_type",
        "author.is_online",
        "author.status",
      ])
      .leftJoin("author.profile", "profile")
      .addSelect([
        "profile.id",
        "profile.name",
        "profile.avatar",
        "profile.cover_image",
        "profile.bio",
      ])
      .leftJoinAndSelect("comment.replies", "replies")
      .leftJoin("replies.author", "replyAuthor")
      .addSelect([
        "replyAuthor.id",
        "replyAuthor.user_type",
        "replyAuthor.is_online",
        "replyAuthor.status",
      ])
      .leftJoin("replyAuthor.profile", "replyProfile")
      .addSelect([
        "replyProfile.id",
        "replyProfile.name",
        "replyProfile.avatar",
        "replyProfile.cover_image",
        "replyProfile.bio",
      ])
      .where("(comment.blogId = :contentId OR comment.postId = :contentId)", {
        contentId,
      })
      .orderBy(`comment.${sortBy || "createdAt"}`, sortOrder || "DESC")
      .skip(skip)
      .take(limit);

    const [comments, total] = await query.getManyAndCount();

    return {
      data: comments,
      meta: { total, page, limit },
    };
  }
}
