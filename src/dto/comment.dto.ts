export interface CreateCommentDTO {
  content: string;
  app_id: string;
  name: string;
  email: string;
}

export interface ReplayCommentDTO extends CreateCommentDTO {
  parentId: string;
}
