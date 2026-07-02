import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RevalidateService } from '../revalidate/revalidate.service';
import { slugify } from '../common/utils/slugify';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
  ) {}

  // ─────────────────────────── PUBLIC ───────────────────────────

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

  // ─────────────────────────── ADMIN ───────────────────────────

  /** Admin list — includes dress counts for the CMS table. */
  findAllAdmin() {
    return this.prisma.collection.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        coverImage: true,
        order: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { dresses: true } },
      },
    });
  }

  async create(dto: CreateCollectionDto) {
    const { slug, ...rest } = dto;
    const collection = await this.prisma.collection.create({
      data: { ...rest, slug: slug ? slugify(slug) : slugify(dto.name) },
    });
    await this.revalidate.revalidate(['collections']);
    return collection;
  }

  async update(id: string, dto: UpdateCollectionDto) {
    const existing = await this.prisma.collection.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Collection "${id}" not found`);
    }

    const { slug, name, ...rest } = dto;
    const collection = await this.prisma.collection.update({
      where: { id },
      // name/slug null → yok say (zorunlu alanlar temizlenemez, 500 yerine no-op)
      data: {
        ...rest,
        ...(name != null && { name }),
        ...(slug != null && { slug: slugify(slug) }),
      },
    });

    await this.revalidate.revalidate(['collections', `collection:${collection.slug}`]);
    return collection;
  }

  async remove(id: string) {
    const existing = await this.prisma.collection.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!existing) {
      throw new NotFoundException(`Collection "${id}" not found`);
    }

    // Dresses keep existing (collectionId set NULL via onDelete: SetNull).
    await this.prisma.collection.delete({ where: { id } });

    await this.revalidate.revalidate([
      'collections',
      `collection:${existing.slug}`,
      'dresses',
    ]);
    return { id, deleted: true };
  }
}
