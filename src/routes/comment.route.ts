import { Router } from "express";
import { CommentController } from "../controllers/comment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { CommentValidation } from "../validation/comment.validation";

const router = Router();
const commentController = new CommentController();

router.get("/app/:id", commentController.getAllCommentsByAppId);

router.post(
  "/",
  validateRequest(CommentValidation.createCommentSchema),
  commentController.createComment,
);
router.post(
  "/replay/:id",
  validateRequest(CommentValidation.replayCommentSchema),
  commentController.replayComment,
);
router.patch(
  "/:id",
  validateRequest(CommentValidation.updateCommentSchema),
  commentController.updateComment,
);
router.delete("/:id", authMiddleware(), commentController.deleteComment);

export default router;
