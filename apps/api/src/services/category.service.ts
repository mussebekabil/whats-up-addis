import { prisma } from '@whats-up-addis/database';
import { AppError } from '../middleware/error-handler.js';

export class CategoryService {
  async getCategories() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    return category;
  }

  async getEventsByCategory(slug: string, page = 1, limit = 20) {
    const category = await this.getCategoryBySlug(slug);

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: {
          categoryId: category.id,
          isActive: true,
        },
        include: {
          category: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          tags: true,
        },
        orderBy: { startDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.event.count({
        where: {
          categoryId: category.id,
          isActive: true,
        },
      }),
    ]);

    return {
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
