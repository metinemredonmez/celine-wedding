import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DressesService } from './dresses.service';
import { QueryDressDto } from './dto/query-dress.dto';

@ApiTags('dresses')
@Controller('dresses')
export class DressesController {
  constructor(private readonly dressesService: DressesService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'collection', required: false, description: 'Collection slug' })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiQuery({ name: 'sort', required: false, enum: ['order', 'createdAt', 'price'] })
  @ApiQuery({ name: 'dir', required: false, enum: ['asc', 'desc'] })
  @ApiOkResponse({ description: 'Paginated list of PUBLISHED dresses.' })
  findAll(@Query() query: QueryDressDto) {
    return this.dressesService.findPublic(query);
  }

  @Get('slugs')
  @ApiOkResponse({ description: 'Published slugs for static generation.' })
  findSlugs() {
    return this.dressesService.findPublishedSlugs();
  }

  @Get(':slug')
  @ApiParam({ name: 'slug', description: 'Dress slug' })
  @ApiOkResponse({ description: 'A published dress with images, collection and related.' })
  findOne(@Param('slug') slug: string) {
    return this.dressesService.findOneBySlug(slug);
  }
}
