import { prisma } from '@whats-up-addis/database';
import {
  CreateCrawlerSourceInput,
  UpdateCrawlerSourceInput,
  calculatePagination,
  EventStatus,
} from '@whats-up-addis/shared';
import { AppError } from '../middleware/error-handler.js';

export class AdminService {
  async getCrawlerSources() {
    return prisma.crawlerSource.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCrawlerSourceById(id: string) {
    const source = await prisma.crawlerSource.findUnique({
      where: { id },
    });

    if (!source) {
      throw new AppError(404, 'Crawler source not found');
    }

    return source;
  }

  async createCrawlerSource(data: CreateCrawlerSourceInput) {
    return prisma.crawlerSource.create({
      data,
    });
  }

  async updateCrawlerSource(id: string, data: UpdateCrawlerSourceInput) {
    const source = await this.getCrawlerSourceById(id);
    console.log('Existing source:', source);
    return prisma.crawlerSource.update({
      where: { id },
      data,
    });
  }

  async deleteCrawlerSource(id: string) {
    await this.getCrawlerSourceById(id);

    await prisma.crawlerSource.delete({
      where: { id },
    });

    return { message: 'Crawler source deleted successfully' };
  }

  async getPendingEvents(page = 1, limit = 20, status?: string) {
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return {
      data: events,
      pagination: calculatePagination(total, page, limit),
    };
  }

  async updateEventStatus(id: string, status: EventStatus) {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new AppError(404, 'Event not found');
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { status },
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
    });

    return updatedEvent;
  }
}
