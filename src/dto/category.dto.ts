export type CreateCategoryDto = {
  name: string;
  description?: string | null;
  parent_cat_id?: string | null;
  category_icon?: string | null;
  category_bg_color?: string | null;
  category_icon_bg_color?: string | null;
};

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
