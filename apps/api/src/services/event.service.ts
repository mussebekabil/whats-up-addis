import { prisma } from '@whats-up-addis/database';
import {
  CreateEventInput,
  UpdateEventInput,
  EventFiltersInput,
  calculatePagination,
  Roles,
  EventStatus,
} from '@whats-up-addis/shared';
import { AppError } from '../middleware/error-handler.js';

export class EventService {
  async getEvents(filters: EventFiltersInput) {
    const {
      categoryId,
      startDate,
      endDate,
      endDateGte,
      endDateLt,
      search,
      minPrice,
      maxPrice,
      isFree,
      page = 1,
      limit = 20,
    } = filters;

    const where: Record<string, unknown> = {
      isActive: true,
      status: EventStatus.Accepted,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Handle startDate filtering for upcoming events
    if (startDate || endDateGte) {
      where.startDate = {} as Record<string, unknown>;
      if (startDate) {
        (where.startDate as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDateGte) {
        (where.startDate as Record<string, unknown>).gte = new Date(endDateGte);
      }
    }

    // Handle past event filtering - check endDate if exists, otherwise startDate
    if (endDateLt) {
      where.OR = [
        // Events with endDate: check if endDate < now
        {
          endDate: {
            not: null,
            lt: new Date(endDateLt),
          },
        },
        // Events without endDate: check if startDate < now
        {
          endDate: null,
          startDate: {
            lt: new Date(endDateLt),
          },
        },
      ];
    }

    if (endDate) {
      where.endDate = {
        gte: new Date(endDate),
      } as Record<string, unknown>;
    }

    if (search) {
      // If we already have an OR clause from endDateLt, we need to combine them with AND
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { location: { contains: search, mode: 'insensitive' } },
              { venue: { contains: search, mode: 'insensitive' } },
            ],
          },
        ];
        delete where.OR;
      } else {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { venue: { contains: search, mode: 'insensitive' } },
        ];
      }
    }

    if (isFree !== undefined) {
      where.price = isFree ? null : { not: null };
    } else {
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {} as Record<string, unknown>;
        if (minPrice !== undefined)
          (where.price as Record<string, unknown>).gte = minPrice;
        if (maxPrice !== undefined)
          (where.price as Record<string, unknown>).lte = maxPrice;
      }
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
        orderBy: { startDate: 'asc' },
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

  async getEventById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
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

    if (!event) {
      throw new AppError(404, 'Event not found');
    }

    return event;
  }

  async createEvent(data: CreateEventInput, userId: string) {
    const { tags, ...eventData } = data;

    const event = await prisma.event.create({
      data: {
        ...eventData,
        startDate: new Date(eventData.startDate),
        endDate: eventData.endDate ? new Date(eventData.endDate) : undefined,
        source: 'manual',
        createdBy: userId,
        tags: tags
          ? {
              create: tags.map((tag) => ({ tag })),
            }
          : undefined,
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
    });

    return event;
  }

  async updateEvent(
    id: string,
    data: UpdateEventInput,
    userId: string,
    userRole: string
  ) {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new AppError(404, 'Event not found');
    }

    // Only allow owner or admin to update
    if (event.createdBy !== userId && userRole !== Roles.Admin) {
      throw new AppError(403, 'Not authorized to update this event');
    }

    const { tags, ...eventData } = data;

    // Convert dates if provided
    const updateData: Record<string, unknown> = { ...eventData };
    if (eventData.startDate) {
      updateData.startDate = new Date(eventData.startDate);
    }
    if (eventData.endDate) {
      updateData.endDate = new Date(eventData.endDate);
    }

    // Update tags if provided
    if (tags) {
      // Delete existing tags and create new ones
      await prisma.eventTag.deleteMany({
        where: { eventId: id },
      });

      updateData.tags = {
        create: tags.map((tag) => ({ tag })),
      };
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
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

  async deleteEvent(id: string, userId: string, userRole: string) {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new AppError(404, 'Event not found');
    }

    // Only allow owner or admin to delete
    if (event.createdBy !== userId && userRole !== Roles.Admin) {
      throw new AppError(403, 'Not authorized to delete this event');
    }

    await prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  async searchEvents(query: string, page = 1, limit = 20) {
    return this.getEvents({
      search: query,
      page,
      limit,
    });
  }
}
