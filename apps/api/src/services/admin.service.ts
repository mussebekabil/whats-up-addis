import { prisma } from '@whats-up-addis/database';
import {
  CreateCrawlerSourceInput,
  UpdateCrawlerSourceInput,
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
}
