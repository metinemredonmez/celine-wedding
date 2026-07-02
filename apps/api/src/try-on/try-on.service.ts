import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TRYON_PROVIDER, type TryOnProvider } from './provider/try-on.provider';
import { CreateTryOnDto } from './dto/create-try-on.dto';

@Injectable()
export class TryOnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(TRYON_PROVIDER) private readonly provider: TryOnProvider,
  ) {}

  async create(dto: CreateTryOnDto) {
    if (this.config.get<string>('TRYON_PROVIDER') === 'disabled') {
      throw new ServiceUnavailableException('Sanal deneme şu an kapalı.');
    }

    // dressId verildiyse her durumda var olduğunu doğrula (FK 500 yerine 404).
    let dressId: string | null = null;
    if (dto.dressId) {
      const dress = await this.prisma.dress.findUnique({
        where: { id: dto.dressId },
        select: { id: true },
      });
      if (!dress) {
        throw new NotFoundException('Seçilen gelinlik bulunamadı');
      }
      dressId = dress.id;
    }

    // Resolve the garment image: explicit URL wins, else the dress cover.
    let garmentImageUrl = dto.garmentImageUrl;
    if (!garmentImageUrl && dressId) {
      const cover = await this.prisma.image.findFirst({
        where: { dressId },
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
        dressId,
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
        jobId: result.jobId ?? null, // async sağlayıcı: poll için sakla
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
