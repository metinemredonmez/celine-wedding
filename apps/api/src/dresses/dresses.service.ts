import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RevalidateService } from '../revalidate/revalidate.service';
import { MediaService } from '../media/media.service';
import { slugify } from '../common/utils/slugify';
import { QueryDressDto } from './dto/query-dress.dto';
import { AdminQueryDressDto } from './dto/admin-query-dress.dto';
import { CreateDressDto } from './dto/create-dress.dto';
import { UpdateDressDto } from './dto/update-dress.dto';
import { AddImageDto } from './dto/add-image.dto';

// Fields returned to admins for a single dress (includes DRAFT-only fields).
const ADMIN_DRESS_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  fabric: true,
  details: true,
  status: true,
  featured: true,
  order: true,
  createdAt: true,
  updatedAt: true,
  collectionId: true,
  collection: { select: { id: true, name: true, slug: true } },
  images: {
    orderBy: { order: 'asc' as const },
    select: {
      id: true,
      url: true,
      publicId: true,
      alt: true,
      width: true,
      height: true,
      order: true,
    },
  },
} satisfies Prisma.DressSelect;

@Injectable()
export class DressesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidate: RevalidateService,
    private readonly media: MediaService,
  ) {}

  // ─────────────────────────── PUBLIC ───────────────────────────

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

  // ─────────────────────────── ADMIN ───────────────────────────

  /** Admin list — includes DRAFT; status is a filter, not a fixed PUBLISHED. */
  async findAllAdmin(q: AdminQueryDressDto) {
    const where: Prisma.DressWhereInput = {
      ...(q.status && { status: q.status }),
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
        select: ADMIN_DRESS_SELECT,
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

  /** Admin detail by id — any status. */
  async findOneAdmin(id: string) {
    const dress = await this.prisma.dress.findUnique({
      where: { id },
      select: ADMIN_DRESS_SELECT,
    });
    if (!dress) {
      throw new NotFoundException(`Dress "${id}" not found`);
    }
    return dress;
  }

  async create(dto: CreateDressDto) {
    const { slug, price, ...rest } = dto;
    const dress = await this.prisma.dress.create({
      data: {
        ...rest,
        slug: slug ? slugify(slug) : slugify(dto.name),
        ...(price !== undefined && { price: new Prisma.Decimal(price) }),
      },
      select: ADMIN_DRESS_SELECT,
    });

    await this.revalidate.revalidate(['dresses', `dress:${dress.slug}`]);
    return dress;
  }

  async update(id: string, dto: UpdateDressDto) {
    const existing = await this.prisma.dress.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!existing) {
      throw new NotFoundException(`Dress "${id}" not found`);
    }

    const { slug, price, ...rest } = dto;
    const dress = await this.prisma.dress.update({
      where: { id },
      data: {
        ...rest,
        ...(slug !== undefined && { slug: slugify(slug) }),
        ...(price !== undefined && { price: new Prisma.Decimal(price) }),
      },
      select: ADMIN_DRESS_SELECT,
    });

    const tags = new Set(['dresses', `dress:${dress.slug}`]);
    if (existing.slug !== dress.slug) {
      tags.add(`dress:${existing.slug}`);
    }
    await this.revalidate.revalidate([...tags]);
    return dress;
  }

  async remove(id: string) {
    const dress = await this.prisma.dress.findUnique({
      where: { id },
      select: { slug: true, images: { select: { publicId: true } } },
    });
    if (!dress) {
      throw new NotFoundException(`Dress "${id}" not found`);
    }

    // Remove Cloudinary assets first (best-effort), then the DB row (cascade
    // deletes the Image rows).
    await Promise.all(
      dress.images.map((img) =>
        this.media.destroy(img.publicId).catch(() => undefined),
      ),
    );
    await this.prisma.dress.delete({ where: { id } });

    await this.revalidate.revalidate(['dresses', `dress:${dress.slug}`]);
    return { id, deleted: true };
  }

  /** Bulk reorder dresses by an ordered id list (index → order). */
  async reorder(ids: string[]) {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.dress.update({ where: { id }, data: { order: index } }),
      ),
    );
    await this.revalidate.revalidate(['dresses']);
    return { reordered: ids.length };
  }

  // ─────────────────────────── IMAGES ───────────────────────────

  async addImage(dressId: string, dto: AddImageDto) {
    const dress = await this.prisma.dress.findUnique({
      where: { id: dressId },
      select: { slug: true },
    });
    if (!dress) {
      throw new NotFoundException(`Dress "${dressId}" not found`);
    }

    const last = await this.prisma.image.findFirst({
      where: { dressId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const nextOrder = last ? last.order + 1 : 0;

    const image = await this.prisma.image.create({
      data: { ...dto, order: nextOrder, dressId },
      select: {
        id: true,
        url: true,
        publicId: true,
        alt: true,
        width: true,
        height: true,
        order: true,
      },
    });

    await this.revalidate.revalidate(['dresses', `dress:${dress.slug}`]);
    return image;
  }

  /** Reorder a dress's gallery by an ordered image-id list. */
  async reorderImages(dressId: string, ids: string[]) {
    const dress = await this.prisma.dress.findUnique({
      where: { id: dressId },
      select: { slug: true },
    });
    if (!dress) {
      throw new NotFoundException(`Dress "${dressId}" not found`);
    }

    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.image.update({
          where: { id, dressId },
          data: { order: index },
        }),
      ),
    );

    await this.revalidate.revalidate(['dresses', `dress:${dress.slug}`]);
    return { reordered: ids.length };
  }

  async removeImage(dressId: string, imageId: string) {
    const image = await this.prisma.image.findFirst({
      where: { id: imageId, dressId },
      select: { id: true, publicId: true, dress: { select: { slug: true } } },
    });
    if (!image) {
      throw new NotFoundException(`Image "${imageId}" not found on dress "${dressId}"`);
    }

    // Cloudinary first (best-effort), then DB row.
    await this.media.destroy(image.publicId).catch(() => undefined);
    await this.prisma.image.delete({ where: { id: imageId } });

    await this.revalidate.revalidate(['dresses', `dress:${image.dress.slug}`]);
    return { id: imageId, deleted: true };
  }
}
