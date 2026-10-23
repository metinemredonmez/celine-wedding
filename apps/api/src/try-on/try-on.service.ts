import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TRYON_PROVIDER, type TryOnInput, type TryOnProvider } from './provider/try-on.provider';
import { CreateTryOnDto } from './dto/create-try-on.dto';

/** DB'ye yazılan yer tutucu: base64 gövde saklanmaz (KVKK + satır boyutu). */
const INLINE_PERSON_IMAGE = 'inline';

@Injectable()
export class TryOnService {
  private readonly logger = new Logger(TryOnService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(TRYON_PROVIDER) private readonly provider: TryOnProvider,
  ) {}

  /**
   * İsteği PENDING olarak yazar ve üretimi ARKA PLANDA başlatır; HTTP yanıtı
   * hemen döner. Sağlayıcı 5-120 sn sürebildiği için istemci GET /try-on/:id
   * ile yoklar (nginx/istemci zaman aşımına takılmamak için).
   */
  async create(dto: CreateTryOnDto) {
    if (this.config.get<string>('TRYON_PROVIDER') === 'disabled') {
      throw new ServiceUnavailableException('Sanal deneme şu an kapalı.');
    }

    const personImage = dto.personImage ?? dto.personImageUrl;
    if (!personImage) {
      throw new BadRequestException('personImage veya personImageUrl gerekli');
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
        personImageUrl: dto.personImageUrl ?? INLINE_PERSON_IMAGE,
        garmentImageUrl,
        status: 'PENDING',
        provider: this.provider.name,
      },
    });

    void this.run(request.id, { personImageUrl: personImage, garmentImageUrl });
    return request;
  }

  /** Arka plan üretimi: sağlayıcıyı çağırır, satırı DONE/FAILED yapar. Asla fırlatmaz. */
  private async run(id: string, input: TryOnInput): Promise<void> {
    try {
      const result = await this.provider.generate(input);
      await this.prisma.tryOnRequest.update({
        where: { id },
        data: {
          status: result.status,
          resultUrl: result.resultUrl ?? null,
          jobId: result.jobId ?? null,
          error: result.error ?? null,
        },
      });
      if (result.status === 'FAILED') this.logger.warn(`try-on ${id} failed: ${result.error}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`try-on ${id} crashed: ${message}`);
      await this.prisma.tryOnRequest
        .update({ where: { id }, data: { status: 'FAILED', error: message } })
        .catch(() => undefined);
    }
  }

  async findOne(id: string) {
    const request = await this.prisma.tryOnRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException(`Try-on "${id}" not found`);
    }
    return request;
  }
}
