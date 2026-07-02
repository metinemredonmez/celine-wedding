import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TRYON_PROVIDER, type TryOnProvider } from './provider/try-on.provider';
import { CreateTryOnDto } from './dto/create-try-on.dto';

@Injectable()
export class TryOnService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(TRYON_PROVIDER) private readonly provider: TryOnProvider,
  ) {}

  async create(dto: CreateTryOnDto) {
    // Resolve the garment image: explicit URL wins, else the dress cover.
    let garmentImageUrl = dto.garmentImageUrl;
    if (!garmentImageUrl && dto.dressId) {
      const cover = await this.prisma.image.findFirst({
        where: { dressId: dto.dressId },
        orderBy: { order: 'asc' },
        select: { url: true },
      });
      if (!cover) {
        throw new NotFoundException('Seçilen gelinliğin görseli yok');
      }
      garmentImageUrl = cover.url;
    }
    if (!garmentImageUrl) {
      throw new BadRequestException('garmentImageUrl veya dressId gerekli');
    }

    const request = await this.prisma.tryOnRequest.create({
      data: {
        dressId: dto.dressId ?? null,
        personImageUrl: dto.personImageUrl,
        garmentImageUrl,
        status: 'PENDING',
        provider: this.provider.name,
      },
    });

    const result = await this.provider.generate({
      personImageUrl: dto.personImageUrl,
      garmentImageUrl,
    });

    return this.prisma.tryOnRequest.update({
      where: { id: request.id },
      data: {
        status: result.status,
        resultUrl: result.resultUrl ?? null,
        error: result.error ?? null,
      },
    });
  }

  async findOne(id: string) {
    const request = await this.prisma.tryOnRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException(`Try-on "${id}" not found`);
    }
    return request;
  }
}
