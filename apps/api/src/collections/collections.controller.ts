import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  // ─────────────────────────── PUBLIC ───────────────────────────

  @Get()
  @ApiOkResponse({ description: 'List collections ordered by `order`.' })
  findAll() {
    return this.collectionsService.findAll();
  }

  // ─────────────────────────── ADMIN ───────────────────────────
  // Static admin path declared before the `:slug` param route.

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'All collections with dress counts (admin).' })
  findAllAdmin() {
    return this.collectionsService.findAllAdmin();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Create a collection.' })
  create(@Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Collection id' })
  @ApiOkResponse({ description: 'Update a collection.' })
  update(@Param('id') id: string, @Body() dto: UpdateCollectionDto) {
    return this.collectionsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Collection id' })
  @ApiOkResponse({ description: 'Delete a collection (its dresses are kept, uncategorised).' })
  remove(@Param('id') id: string) {
    return this.collectionsService.remove(id);
  }

  // ─────────────────────────── PUBLIC (param) ───────────────────────────

  @Get(':slug')
  @ApiParam({ name: 'slug', description: 'Collection slug' })
  @ApiOkResponse({ description: 'A collection with its published dresses.' })
  findOne(@Param('slug') slug: string) {
    return this.collectionsService.findOneBySlug(slug);
  }
}
