import { prisma } from "../config/prisma";
import AppError from "../utils/AppError";

export class CategoryService {
  public async getAllCategories() {
    return prisma.category.findMany({
      include: {
        children: true,
      },
    });
  }

  public async createCategory(data: {
    name: string;
    slug: string;
    parentId?: string;
  }) {
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new AppError("Category slug already exists", 400);
    }

    return prisma.category.create({
      data,
    });
  }

  public async updateCategory(
    id: string,
    data: { name?: string; slug?: string; parentId?: string }
  ) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  public async deleteCategory(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}
