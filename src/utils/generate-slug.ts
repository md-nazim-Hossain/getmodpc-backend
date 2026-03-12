import slugify from "slugify";
import { Repository } from "typeorm";
import { SlugEntity } from "../types";

export const generateUniqueSlug = async <T extends SlugEntity>(
  name: string,
  repo: Repository<T>,
  excludeId?: string | number,
): Promise<string> => {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await repo.findOne({
      where: { slug } as any,
    });

    if (!existing || existing.id === excludeId) break;

    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
};
