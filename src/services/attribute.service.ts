import { prisma } from "../config/prisma";
import AppError from "../utils/AppError";

export class AttributeService {
  public async getAllAttributes() {
    return prisma.attribute.findMany({
      include: {
        values: true,
      },
    });
  }

  public async createAttribute(name: string) {
    const existing = await prisma.attribute.findUnique({
      where: { name },
    });

    if (existing) {
      throw new AppError("Attribute already exists", 400);
    }

    return prisma.attribute.create({
      data: { name },
      include: { values: true },
    });
  }

  public async addAttributeValue(attributeId: string, value: string) {
    const attribute = await prisma.attribute.findUnique({
      where: { id: attributeId },
    });

    if (!attribute) {
      throw new AppError("Attribute not found", 404);
    }

    // Check if value exists for this attribute
    const existingValue = await prisma.attributeValue.findFirst({
      where: {
        attributeId,
        value,
      },
    });

    if (existingValue) {
      throw new AppError("Value already exists for this attribute", 400);
    }

    return prisma.attributeValue.create({
      data: {
        attributeId,
        value,
      },
    });
  }

  public async deleteAttribute(id: string) {
    return prisma.attribute.delete({
      where: { id },
    });
  }

  public async deleteAttributeValue(id: string) {
    return prisma.attributeValue.delete({
      where: { id },
    });
  }
}
