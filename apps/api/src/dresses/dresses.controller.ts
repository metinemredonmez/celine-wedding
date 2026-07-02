import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DressesService } from './dresses.service';
import { QueryDressDto } from './dto/query-dress.dto';
import { AdminQueryDressDto } from './dto/admin-query-dress.dto';
import { CreateDressDto } from './dto/create-dress.dto';
import { UpdateDressDto } from './dto/update-dress.dto';
import { ReorderDto } from './dto/reorder.dto';
import { AddImageDto } from './dto/add-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dresses')
@Controller('dresses')
export class DressesController {
  constructor(private readonly dressesService: DressesService) {}

  // ─────────────────────────── PUBLIC ───────────────────────────

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

  // ─────────────────────────── ADMIN ───────────────────────────
  // NOTE: static admin sub-paths are declared before `:slug` / `:id` so they
  // are not shadowed by the param routes.

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Paginated list of ALL dresses (incl. DRAFT).' })
  findAllAdmin(@Query() query: AdminQueryDressDto) {
    return this.dressesService.findAllAdmin(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Create a dress.' })
  create(@Body() dto: CreateDressDto) {
    return this.dressesService.create(dto);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Bulk reorder dresses by an ordered id list.' })
  reorder(@Body() dto: ReorderDto) {
    return this.dressesService.reorder(dto.ids);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Dress id' })
  @ApiOkResponse({ description: 'A single dress (any status) for admin editing.' })
  findOneAdmin(@Param('id') id: string) {
    return this.dressesService.findOneAdmin(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Dress id' })
  @ApiOkResponse({ description: 'Update a dress.' })
  update(@Param('id') id: string, @Body() dto: UpdateDressDto) {
    return this.dressesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Dress id' })
  @ApiOkResponse({ description: 'Delete a dress and its Cloudinary assets.' })
  remove(@Param('id') id: string) {
    return this.dressesService.remove(id);
  }

  // ─────────────────────────── IMAGES (admin) ───────────────────────────

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Dress id' })
  @ApiCreatedResponse({ description: 'Attach an uploaded Cloudinary asset to a dress.' })
  addImage(@Param('id') id: string, @Body() dto: AddImageDto) {
    return this.dressesService.addImage(id, dto);
  }

  @Patch(':id/images/reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Dress id' })
  @ApiOkResponse({ description: 'Reorder a dress gallery by an ordered image-id list.' })
  reorderImages(@Param('id') id: string, @Body() dto: ReorderDto) {
    return this.dressesService.reorderImages(id, dto.ids);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Dress id' })
  @ApiParam({ name: 'imageId', description: 'Image id' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Delete a gallery image (DB row + Cloudinary asset).' })
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.dressesService.removeImage(id, imageId);
  }

  // ─────────────────────────── PUBLIC (param) ───────────────────────────

  @Get(':slug')
  @ApiParam({ name: 'slug', description: 'Dress slug' })
  @ApiOkResponse({ description: 'A published dress with images, collection and related.' })
  findOne(@Param('slug') slug: string) {
    return this.dressesService.findOneBySlug(slug);
  }
}
