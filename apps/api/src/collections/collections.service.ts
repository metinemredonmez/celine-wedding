import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public list, ordered by `order` then name. */
  findAll() {
    return this.prisma.collection.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        coverImage: true,
        order: true,
      },
    });
  }

  /** Public detail: a collection with its PUBLISHED dresses (cover thumb each). */
  async findOneBySlug(slug: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        coverImage: true,
        order: true,
        dresses: {
          where: { status: 'PUBLISHED' },
          orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
          select: {
            id: true,
            name: true,
            slug: true,
            fabric: true,
            featured: true,
            order: true,
            images: {
              orderBy: { order: 'asc' },
              take: 1,
              select: { url: true, alt: true, width: true, height: true },
            },
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException(`Collection "${slug}" not found`);
    }

    return collection;
  }
}
