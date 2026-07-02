import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';

@ApiTags('collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOkResponse({ description: 'List collections ordered by `order`.' })
  findAll() {
    return this.collectionsService.findAll();
  }

  @Get(':slug')
  @ApiParam({ name: 'slug', description: 'Collection slug' })
  @ApiOkResponse({ description: 'A collection with its published dresses.' })
  findOne(@Param('slug') slug: string) {
    return this.collectionsService.findOneBySlug(slug);
  }
}
