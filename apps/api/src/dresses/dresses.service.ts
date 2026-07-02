import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryDressDto } from './dto/query-dress.dto';

@Injectable()
export class DressesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Public, paginated list. Status is forced to PUBLISHED server-side.
   * List payload carries only the cover thumbnail (first image).
   */
  async findPublic(q: QueryDressDto) {
    const where: Prisma.DressWhereInput = {
      status: 'PUBLISHED',
      ...(q.featured !== undefined && { featured: q.featured }),
      ...(q.collection && { collection: { slug: q.collection } }),
    };

    const orderBy: Prisma.DressOrderByWithRelationInput = { [q.sort]: q.dir };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.dress.count({ where }),
      this.prisma.dress.findMany({
        where,
        orderBy,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        select: {
          id: true,
          name: true,
          slug: true,
          fabric: true,
          featured: true,
          order: true,
          collection: { select: { name: true, slug: true } },
          images: {
            orderBy: { order: 'asc' },
            take: 1,
            select: { url: true, alt: true, width: true, height: true },
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page: q.page,
        limit: q.limit,
        totalPages: Math.ceil(total / q.limit),
      },
    };
  }

  /** Published slugs only — feeds Next.js `generateStaticParams`. */
  findPublishedSlugs() {
    return this.prisma.dress.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { updatedAt: 'desc' },
      select: { slug: true },
    });
  }

  /** Public detail: a published dress with ordered images, collection and related dresses. */
  async findOneBySlug(slug: string) {
    const dress = await this.prisma.dress.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        fabric: true,
        details: true,
        featured: true,
        order: true,
        collectionId: true,
        collection: { select: { name: true, slug: true } },
        images: {
          orderBy: { order: 'asc' },
          select: { id: true, url: true, alt: true, width: true, height: true, order: true },
        },
      },
    });

    if (!dress) {
      throw new NotFoundException(`Dress "${slug}" not found`);
    }

    const related = await this.prisma.dress.findMany({
      where: {
        status: 'PUBLISHED',
        slug: { not: slug },
        ...(dress.collectionId && { collectionId: dress.collectionId }),
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        images: {
          orderBy: { order: 'asc' },
          take: 1,
          select: { url: true, alt: true, width: true, height: true },
        },
      },
    });

    return { ...dress, related };
  }
}
